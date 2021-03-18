    //Adapt this to Profile picture
  const profileRegister = document.getElementById('profileRegister');
  const imageUpload      = document.getElementById('profilePic');
    
    function hasExtension(exts) {
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(imageUpload.value);
       }

    profileRegister.addEventListener('submit', function(event) {
         if (imageUpload.value.length > 0) {
           if(!hasExtension(['.jpg', '.jpeg', '.png'])){
            event.preventDefault();
            return alert('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images');
           }

        }
    });