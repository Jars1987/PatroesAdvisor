let restaurantEditForm = document.getElementById('restaurantEditForm');
function hasExtension(inputID, exts) {
  var fileName = document.getElementById(inputID).value;
  return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
   }

restaurantEditForm.addEventListener('submit', function(event) {
  let imageUploads       = document.querySelector('.imageUpload').files.length;
  let existingImgs       = document.querySelectorAll('.imageDeleteCheckbox').length; 
  let imgDeletions       = document.querySelectorAll('.imageDeleteCheckbox:checked').length;
  let newTotal = existingImgs - imgDeletions + imageUploads;
  let removalAmount = newTotal - 6;
  if( newTotal > 6){
    event.preventDefault();
    return alert(`Sorry! Only 6 images per Restaurant are allowed. You need to remove at leat ${removalAmount} image${removalAmount === 1 ? '' : 's'}.`);
  } else if ( newTotal === 0) {
    event.preventDefault();
    return alert('Sorry! A Restaurant must contain at least one Image.');
  } else if(imageUploads > 0){
     if (!hasExtension('formFileMultiple', ['.jpg', '.jpeg', '.png'])) {
     event.preventDefault();
     return alert('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images');
    }
  }
});