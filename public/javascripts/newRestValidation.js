 let newRestaurantForm = document.getElementById('newRestaurantForm');

      function hasExtension(inputID, exts) {
      var fileName = document.getElementById(inputID).value;
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
       }
       
      newRestaurantForm.addEventListener('submit', function(event) {
      let imageUploads       = document.querySelector('#formFileMultiple').files.length;
      if( imageUploads > 6){
        event.preventDefault();
        return alert('Sorry! Only 6 images per Restaurant are allowed.');
      } else if ( imageUploads === 0) {
        event.preventDefault();
        return alert('Sorry! A Restaurant must contain at least one Image.');
      } else if (!hasExtension('formFileMultiple', ['.jpg', '.jpeg', '.png'])) {
        event.preventDefault();
        return alert('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images');
      }
    });
    