const restaurantEditForm = document.getElementById('restaurantEditForm');
const validationMessage = document.getElementById('validationMessage');

function hasExtension(inputID, exts) {
  const fileName = document.getElementById(inputID).value;
  return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
   }

function validateImages (message, add, remove) {
  validationMessage.textContent = message;
  validationMessage.classList.add(add);
  validationMessage.classList.remove(remove);
  }

restaurantEditForm.addEventListener('submit', function(event) {
  const imageFiles         = document.getElementById('formFileMultiple').files;
  const imageUploads       = imageFiles.length;
  const existingImgs       = document.querySelectorAll('.imageDeleteCheckbox').length; 
  const imgDeletions       = document.querySelectorAll('.imageDeleteCheckbox:checked').length;
  
  let newTotal = existingImgs - imgDeletions + imageUploads;
  let removalAmount = newTotal - 6;
  if( newTotal > 6){
    event.preventDefault();
    validateImages(`Sorry! Only 6 images per Restaurant are allowed. You need to remove at leat ${removalAmount} image${removalAmount === 1 ? '' : 's'}.`, 'color-red', 'color-green');
  } else if ( newTotal === 0) {
    event.preventDefault();
    validateImages('Sorry! A Restaurant must contain at least one Image.', 'color-red', 'color-green');
  } else if(imageUploads > 0) {
    if(!hasExtension('formFileMultiple', ['.jpg', '.jpeg', '.png'])){
      event.preventDefault();
      validateImages('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images', 'color-red', 'color-green');
    } 
  } else if (imageFiles){
    for(file of imageFiles){
      if(file.size > 2500000){
      event.preventDefault();
      validateImages('Sorry! The image(s) you are trying to submit are over the 2.5Mb size limit.', 'color-red', 'color-green');
      }
    }
  } else {
    validateImages('Looks Good', 'color-green', 'color-red');
  }
});