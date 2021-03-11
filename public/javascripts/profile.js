let newPasswordValue;
let confirmationValue;
const submitBtn = document.getElementById('updateProfile');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message');
const editProfileForm = document.getElementById('profileEditForm');
const toggleBtn = document.getElementById('editProfileBtn');

function validatePasswords (message, add, remove) {
  validationMessage.textContent = message;
  validationMessage.classList.add(add);
  validationMessage.classList.remove(remove);
}

confirmation.addEventListener('input', e => {
  newPasswordValue = newPassword.value;
  confirmationValue = confirmation.value;
  if (newPasswordValue !== confirmationValue){
    validatePasswords('Passwords must match!', 'color-red', 'color-green');
    submitBtn.setAttribute('disabled', true);
  } else {
    validatePasswords('Passwords match!', 'color-green', 'color-red');
    submitBtn.removeAttribute('disabled')
  }
});

toggleBtn.addEventListener('click', function (e) {
  (toggleBtn.innerText === 'Edit Profile') ? toggleBtn.innerText = 'Cancel': toggleBtn.innerText = 'Edit Profile';
  editProfileForm.classList.toggle('edit-profile-form');
})
