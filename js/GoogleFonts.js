  WebFontConfig = {
    google: { families: [] }
  };

var loadFontsMethod;

function loadGoogleFonts() {
    // TODO: Retrieve the fonts from the DB (parse objects) and construct the WebFontConfig variable
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
    //TODO: Add the font's to the select/dropbox
    if(loadFontsMethod !== undefined)
        loadFontsMethod();
};