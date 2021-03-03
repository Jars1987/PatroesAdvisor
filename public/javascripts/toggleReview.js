  //edit-review-form class as hiddden in stylsheet show.css
  const toggleBtn = document.querySelectorAll('.toggle-edit-form');
  const editForm  = document.querySelectorAll('.edit-review-form'); 

  for(let i = 0; i < toggleBtn.length; i++){
    toggleBtn[i].addEventListener('click', function (e) {
  //toggle the btn text
    (toggleBtn[i].innerText === 'Update') ? toggleBtn[i].innerText = 'Cancel': toggleBtn[i].innerText = 'Update';
   //toggle visibility of the edit review form
   editForm[i].classList.toggle('edit-review-form');
})
  }