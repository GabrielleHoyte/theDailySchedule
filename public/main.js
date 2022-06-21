console.log('Connected')
const trash = document.getElementsByClassName("createStaffDelete");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const nurseName = this.parentNode.parentNode.childNodes[1].innerText
        const type = this.parentNode.parentNode.childNodes[3].innerText
        const department = this.parentNode.parentNode.childNodes[5].innerText
        const shift = this.parentNode.parentNode.childNodes[7].innerText
        console.log(department)
        fetch('/nurses', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': nurseName,
            'type': type,
            'dept': department,
            'shift': shift
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

const trashTwo = document.getElementsByClassName("scheduleDelete");
console.log(Array.from(trashTwo).length)
Array.from(trashTwo).forEach(function(element) {
      element.addEventListener('click', function(){
        const nurseName = this.parentNode.parentNode.childNodes[1].innerText
        const type = this.parentNode.parentNode.childNodes[3].innerText
        const department = this.parentNode.parentNode.childNodes[5].innerText
        const shift = this.parentNode.parentNode.childNodes[7].innerText
        console.log(department)
        fetch('/schedule', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': nurseName,
            'type': type,
            'dept': department,
            'shift': shift
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

const editButton = document.querySelector('.editButton');

editButton.addEventListener('click', function(){
  const id = document.querySelector('.staffMemberId')
  const nurseName = document.querySelector('.staffMemberName').innerText
  const department =  document.querySelector('input[name=dept]:checked').value
  const shift = document.querySelector('input[name=shift]:checked').value
  fetch('/editStaff', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // 'staffID': id,
      'name': nurseName,
      'dept': department,
      'shift': shift
    })
  }).then(function (response) {
    window.location.reload()
  })
})

const trashThree = document.getElementsByClassName("editDelete");
Array.from(trashThree).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.getAttribute('data-id')
        console.log('id:', id)
        fetch('/editStaff', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'id': id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});