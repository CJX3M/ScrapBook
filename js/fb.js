function initializeFB() {
    $.ajaxSetup({cache: true});
    $.getScript('//connect.facebook.net/en_US/all.js', function(){
      FB.init({
        appId      : '1406195122990310',
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
      });

      // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
      // for any authentication related change, such as login, logout or session refresh. This means that
      // whenever someone who was previously logged out tries to log in again, the correct case below 
      // will be handled. 
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        // Here we specify what we do with the response anytime this event occurs. 
        if (response.status === 'connected') {
          // The response object is returned with a status field that lets the app know the current
          // login status of the person. In this case, we're handling the situation where they 
          // have logged in to the app.
          //testAPI();
            $(".login").hide();
            enlistarAlbums();
        } else if (response.status === 'not_authorized') {
          // In this case, the person is logged into Facebook, but not into the app, so we call
          // FB.login() to prompt them to do so. 
          // In real-life usage, you wouldn't want to immediately prompt someone to login 
          // like this, for two reasons:
          // (1) JavaScript created popup windows are blocked by most browsers unless they 
          // result from direct interaction from people using the app (such as a mouse click)
          // (2) it is a bad experience to be continually prompted to login upon page load.
          FB.login();
        } else {
          // In this case, the person is not logged into Facebook, so we call the login() 
          // function to prompt them to do so. Note that at this stage there is no indication
          // of whether they are logged into the app. If they aren't then they'll see the Login
          // dialog right after they log in to Facebook. 
          // The same caveats as above apply to the FB.login() call here.
          FB.login();
        }
      });        
    });
    $('#loginbutton,#feedbutton').removeAttr('disabled');
    //FB.getLoginStatus(updateStatusCallback);
    //  // Load the SDK asynchronously
    //  (function(d){
    //   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    //   if (d.getElementById(id)) {return;}
    //   js = d.createElement('script'); js.id = id; js.async = true;
    //   js.src = "//connect.facebook.net/en_US/all.js";
    //   ref.parentNode.insertBefore(js, ref);
    //  }(document));
}

var gruposUsuario;
var permisosUsuario;
// Here we run a very simple test of the Graph API after login is successful. 
// This testAPI() function is only called in those cases. 
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.');
        revisarPermisos();
    });
}

function revisarPermisos(){
    FB.api('/me/permissions', function(response){
        permisosUsuario = response.data[0];
        if(typeof permisosUsuario.user_groups !== 'undefined' &&
          permisosUsuario.user_groups === 1)
            enlistarGrupos();
        else
            Login();  
        if(typeof permisosUsuario.publish_actions === 'undefined' ||
          permisosUsuario.publish_actions === 0)
            Login();  
    });
}

function Login(){
    FB.login(function(response) {
        //revisarPermisos();
        enlistarAlbums();
     }, {scope: 'user_groups, publish_actions, user_photos', auth_type: 'rerequest'});
}

function enlistarAlbums(){
    FB.api("/me/albums",
        function (response) {
          if (response && !response.error) {
            var id = 0;
            for(var i = 0; i < response.data.length; i++)
            {                    
                $("#albums").append("<li style='cursor:pointer' onclick='enlistPreviews(\"" + response.data[i].id + "\", $(this));'>" + response.data[i].name + "</li>");
            }
        }
    });
}

function enlistPreviews(albumId, list) {
    if(list.find("#photoList").length == 0)
    {
        FB.api("/" + albumId + "/photos", function(response){
            if(response && !response.error){
                var photoList = $("<ol id='photoList' style='display:hidden'></ol>");
                for(var i = 0; i < response.data.length; i++){
                    var listItem = $("<li></li>");
                    var pic = $("<img src='" + findThumbnail(response.data[i].images) + "' draggable=\"true\"  ondragstart=\"handleDragStart(event)\" ondragend=\"handleDragEnd(event)\">")
                    pic.data("obj", response.data[i]);
                    listItem.append(pic);
                    photoList.append(listItem);
                }
                list.append(photoList);
                list.addClass("expanded");
                list.find("#photoList").show("slow");
            }
        })
    }else{
        if(list.hasClass("expanded")){
            list.removeClass("expanded");
            list.find("#photoList").hide("fast");
        }else{
            list.addClass("expanded");
            list.find("#photoList").show("slow");
        }
    };
}

function findThumbnail(images) {
    var source, smallestWidth;
    smallestWidth = images[0].width;
    source = images[0].source;
    for(var i = 1; i < images.length; i++){
        if(smallestWidth > images[i].width){
            smallestWidth = images[i].width;
            source = images[i].source;
        }
    }
    return source;
}