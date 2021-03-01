    //Adapt this to Profile picture
    let profileRegister = document.getElementById('profileRegister');
    
    function hasExtension(inputID, exts) {
      var fileName = document.getElementById(inputID).value;
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
       }

    profileRegister.addEventListener('submit', function(event) {
         if (!hasExtension('profilePic', ['.jpg', '.jpeg', '.png'])) {
         event.preventDefault();
         return alert('Sorry! A Restaurant only accepts JPG, JPEG and PNG Images');
        }
    });