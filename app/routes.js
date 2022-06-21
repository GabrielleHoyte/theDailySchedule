module.exports = function (app, passport, db, ObjectId) {

  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  let date = mm + '/' + dd + '/' + yyyy;

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // SCHEDULE PAGE =========================
  app.get('/schedule', isLoggedIn, function (req, res) {
    db.collection('nurses').find().toArray((err, result) => {
      db.collection('theSchedule').find({ date: date }).toArray((err, schedule) => {
        db.collection('daysOff').find({ dates: date }).toArray((err, daysOff) => {
          let staffMemberIsOff = []
          daysOff.forEach(el => {
            if (el.dates.includes(date)) {
              staffMemberIsOff.push(el.name)
            }
          })
          let PTOArray = daysOff.map(x => x.name)
          if (err) return console.log(err)
          let sortedNurses = result.sort((a,b) => a.name < b.name ? -1 : 1)
          res.render('schedule.ejs', {
            user: req.user,
            nurses: sortedNurses,
            schedule: schedule,
            PTOArray: PTOArray
          })
        })
      })
    })
  });

  app.post('/addToSchedule', (req, res) => {
    db.collection('theSchedule').insertOne({ name: req.body.name, type: req.body.type, dept: req.body.dept, shift: req.body.shift, date: date }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/schedule')
    })
  })

  app.delete('/schedule', (req, res) => {
    db.collection('theSchedule').findOneAndDelete({ name: req.body.name, type: req.body.type, dept: req.body.dept, shift: req.body.shift, date: date }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  //CREATE STAFF PAGE =========================
  app.get('/createStaff', isLoggedIn, function (req, res) {
    db.collection('nurses').find().toArray((err, result) => {
      if (err) return console.log(err)
      let sortedNurses = result.sort((a,b) => a.name < b.name ? -1 : 1)
      res.render('createStaff.ejs', {
        user: req.user,
        nurses: sortedNurses,
        date: date
      })
    })
  });

  app.post('/nurses', (req, res) => {
    db.collection('nurses').insertOne({ name: req.body.nurseName, type: req.body.type, dept: req.body.department, shift: req.body.shift }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/createStaff')
    })
  })

  //deletes all the events for that one staff member for the day
  //BAD CODE
  app.delete('/nurses', (req, res) => {

    db.collection('nurses').findOneAndDelete({ name: req.body.name, type: req.body.type, dept: req.body.dept, shift: req.body.shift }, (err, result) => {
    })

    db.collection('theSchedule').findOneAndDelete({ name: req.body.name, type: req.body.type, dept: req.body.dept, shift: req.body.shift, date: date }, (err, result) => {
    })
    // return res.send(500, err)
    res.send('Message deleted!')
  })

  //CREATE NURSES SIGNUP ============================
  app.get('/createSignup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/createSignup', passport.authenticate('local-signup', {
    successRedirect: '/createStaff',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
  }));

  //EDIT STAFF PAGE =================================
  app.get('/editStaff/:staffID', isLoggedIn, function (req, res) {
    console.log(`staffID = ${req.params.staffID}`)
    console.log('A note: ', req.body)
    let postId = ObjectId(req.params.staffID)
    console.log(postId)
    db.collection('nurses').find({ _id: postId }).toArray((err, result) => {
      db.collection('daysOff').find({ name: result[0].name }).toArray((err, daysOff) => {
        console.log('Beep:', daysOff)
        if (err) return console.log(err)
        res.render('editStaff.ejs', {
          nurses: result[0],
          daysOff: daysOff
        })
      })
    })
  });

  app.put('/editStaff', (req, res) => {
    let postId = ObjectId(req.body.staffID)
    db.collection('nurses').findOneAndUpdate(
      { name: req.body.name },
      {
        $set: {
          dept: req.body.dept,
          shift: req.body.shift
        }
      },
      {
        upsert: false
      }
    )
      .then(result => { res.json('Success') })
      .catch(error => { console.error(error); res.send(500, err) })
  })

  app.post('/addDaysOff', (req, res) => {
    const startDate = new Date(req.body.ptoStart)
    const endDate = new Date(req.body.ptoEnd)
    let dates = getDatesInRange(startDate, endDate)
    db.collection('daysOff').insertOne({ name: req.body.name, dates: dates }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(`/editStaff/${req.body.staffID}`)
    })
  })

  app.delete('/editStaff', (req, res) => {
    db.collection('daysOff').findOneAndDelete({ _id: ObjectId(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/schedule', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/schedule', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/nurses');
    });
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

//Gets the date in the range for the PTO
function getDatesInRange(startDate, endDate) {
  const date = new Date(startDate.getTime());
  let range = []
  let dates = [startDate, endDate];

  date.setDate(date.getDate() + 1);


  while (date < endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  dates.forEach(date => {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    let formattedDate = mm + '/' + dd + '/' + yyyy;
    range.push(formattedDate)
  })
  return range.sort()

}