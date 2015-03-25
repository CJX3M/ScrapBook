  WebFontConfig = {
    google: { families: [ 'Poiret+One::latin', 'Cherry+Cream+Soda::latin', 'Lobster::latin', 'Reenie+Beanie::latin', 'Shadows+Into+Light::latin', 'Gloria+Hallelujah::latin', 'Calligraffitti::latin', 'Indie+Flower::latin', 'Pacifico::latin', 'Dancing+Script::latin', 'Ultra::latin', 'Rock+Salt::latin', 'Chewy::latin', 'Architects+Daughter::latin' ] }
  };

  (function() {
    // TODO: Retrieve the fonts from the DB (parse objects) and construct the WebFontConfig variable
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
    //TODO: Add the font's to the select/dropbox
  })();