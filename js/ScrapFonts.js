var ScrapFonts = [];
var ScrapFont = Parse.Object.extend("ScrapFont", {
    name: '',
    style: '',
    family: '',
    Save: function(callBack){
        this.save({
            Name: this.name,
            Style: this.style,
            FontFamily: this.family
        },{
            error: function(_function, _error){
                console.error("Can't save font: " + error);
            },
        }).then(function(font){
            if(ScrapFonts.indexOf(font) == -1)
                ScrapFonts.push(font);
            if(callBack !== undefined)
                callBack();
        });
    },    
},{
    create: function(_font){
        var font = new ScrapFont();
        font.id = _font.id;
        font.name = _font.get("Name");
        font.family = _font.get("FontFamily");
        font.style = _font.get("Style");
        return font;
    },
    getFonts: function(callBack){
        var scrapFontsCollection = Parse.Collection.extend({
            model: ScrapFont,
        });
        var collection = new scrapFontsCollection();
        var loadedFonts = false;
        collection.fetch({
            success: function(fonts){
                var pgrRate = fonts.length * 0.1;
                for(var i = 0; i < fonts.length; i++){
                    if(UpdateSCProgressBar !== undefined)
                        UpdateSCProgressBar(pgrRate * i, true, "Retrieving Fonts");
                    ScrapFonts.push(ScrapFont.create(fonts.models[i]));
                    WebFontConfig.google.families.push(ScrapFonts[i].family);
                }
                if(callBack !== undefined)
                    callBack();
            },
            error: function(col, error){
                console.error("Can't retrieve fonts collection: " + error);
            }
        });
    }
})