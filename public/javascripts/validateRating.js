const reviewForm   = document.querySelector('#reviewForm');
const noRate = document.querySelector('#reviewForm.input-no-rate');

reviewForm.addEventListener('submit', (e) => {
 if(noRate.checked){
   e.preventDefaut();
   alert('At least one Star rating needd to Review Restaurant!')
 }
})