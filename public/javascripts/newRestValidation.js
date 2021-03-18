 const newRestaurantForm = document.getElementById('newRestaurantForm');
 const validationMessage = document.getElementById('validationMessage');



      function hasExtension(inputID, exts) {
      let fileName = document.getElementById(inputID).value;
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
       }
       
      newRestaurantForm.addEventListener('submit', function(event) {
      const imageUploads       = document.querySelector('#formFileMultiple').files.length;
      const imageFiles         = document.getElementById('formFileMultiple').files;

      function validateImages (message, add, remove) {
        validationMessage.textContent = message;
        validationMessage.classList.add(add);
        validationMessage.classList.remove(remove);
      }

      if( imageUploads > 6){
        event.preventDefault();
        validateImages('Sorry! Only 6 images per Restaurant are allowed.', 'color-red', 'color-green');
      } else if ( imageUploads === 0) {
        event.preventDefault();
        validateImages('Sorry! A Restaurant must contain at least one Image.', 'color-red', 'color-green');
      } else if (!hasExtension('formFileMultiple', ['.jpg', '.jpeg', '.png'])) {
        event.preventDefault();
        validateImages('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images.', 'color-red', 'color-green');
      } else if(imageFiles){
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




    
