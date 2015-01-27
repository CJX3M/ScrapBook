window.fbAsyncInit = function() {
     $.ajaxSetup({cache: true});

    Parse.FacebookUtils.init({ // this line replaces FB.init({
        appId      : '1579130992305490', // Facebook App ID
        status     : true,  // check Facebook Login status
        cookie     : true,  // enable cookies to allow Parse to access the session
        xfbml      : true,  // initialize Facebook social plugins on the page
        version    : 'v2.2' // point to the latest Facebook Graph API version
    });
 
    // Run code after the Facebook SDK is loaded.
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        $(".login").hide();
        initializeCanvas();
        enlistarAlbums();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
    }
}

var gruposUsuario;
var permisosUsuario;

function Login(){
    /*FB.login(function(response) {
        //revisarPermisos();
        enlistarAlbums();
     }, {scope: 'user_groups, publish_actions, user_photos', auth_type: 'rerequest'});*/
    Parse.FacebookUtils.logIn('user_photos, user_email', {
        success: function(user) {
                $(".login").hide();
                initializeCanvas();
                enlistarAlbums();
            },
        error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
        }
    });
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

function obtenerUsuario(){
    FB.api("/me", function(response){
        console.log(response)
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