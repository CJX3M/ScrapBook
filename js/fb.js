var LoggedUser;

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
        Login();
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
    Parse.FacebookUtils.logIn('user_photos, email', {
        success: function(user) {
                $(".login").hide();
                ListAlbums();
                LoggedUser = user;
                ListScrapbooks();
            },
        error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
        }
    });
}

function ListAlbums(){
    FB.api("/me/albums",
        function (response) {
          if (response && !response.error) {
            var id = 0;
            for(var i = 0; i < response.data.length; i++)
            {                    
                $("#albums").append("<a href='#' class='list-group-item' onclick='enlistPreviews(\"" + response.data[i].id + "\", $(this));'>" +
                                    "<span class='glyphicon glyphicon-folder-close folderIcon' aria-hidden='true'></span> " + response.data[i].name + "</a>");
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
                var photoList = $("<ol id='photoList' style='display:hidden; height:320px; overflow-y:scroll; list-style-type: none;padding: 0px;margin: 0px;'></ol>");
                for(var i = 0; i < response.data.length; i++){
                    var listItem = $("<li class='imagesLst list-inline'></li>");
                    var image = findThumbnail(response.data[i].images);
                    var pic = $("<div><img src='" + image.source + "' " + getSizeAdjust(image) + " draggable=\"true\"  ondragstart=\"handleDragStart(event)\" ondragend=\"handleDragEnd(event)\"></div>" + 
                                "<span>" + response.data[i].name + "</span>")
                    pic.find("img").data("obj", response.data[i]);
                    listItem.append(pic);
                    photoList.append(listItem);
                }
                list.append(photoList);
                list.addClass("expanded");
                list.find('.folderIcon').toggleClass("glyphicon-folder-close").toggleClass("glyphicon-folder-open");
                list.find("#photoList").show("slow");
            }
        })
    }else{
        list.toggleClass('expanded');
        list.find('.folderIcon').toggleClass("glyphicon-folder-close").toggleClass("glyphicon-folder-open");
        list.find("#photoList").toggle();
    };
}

function findThumbnail(images) {
    var source, smallestWidth, retImage;
    retImage = images[0];
    smallestWidth = images[0].width;
    source = images[0].source;
    for(var i = 1; i < images.length; i++){
        if(smallestWidth > images[i].width){
            smallestWidth = images[i].width;
            retImage = images[i];
        }
    }
    return retImage;
}

function getSizeAdjust(image){
    var style = "style='width: calc(100% - 20px);height: auto;'";
    if(image.width < image.height)
        style = "style='height: calc(100% - 10px);width: auto;'";
    return style;
}
