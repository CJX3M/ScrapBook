var ScrapSticker = [];
var ScrapSticker = new Parse.Object.extend("ScrapSticker", {
    title: '',
    url: '',
    Save: function(callBack){
        this.save({
            Title: this.title,
            Utl: this.url,
        }, {
            success: function(_scrap){
                console.log(_scrap.id)
                if(callBack !== undefined)
                    callBack();
            },
            error: function(_scrap, error){
                console.error("Failed to save sticker: " + error);
            }
        });
    },
},{
    create: function(_sticker){
        var sticker = new ScrapSticker();
        sticker.id = _sticker.id;
        sticker.title = _sticker.get("Title");
        sticker.url = _sticker.get("Url");
        return sticker;
    },
    findSticker: function(scrapId) {
        var query = Parse.Query(ScrapSticker);
        return query.get(scrapId, {
            success: function(_scrap){
                var sticker = ScrapSticker.create(_scrap);
                return sticker;
            }
        })
    },
    getStickers: function(callBack){
        var stickerCollection = Parse.Collection.extend({
            model: ScrapSticker,
        });
        var collection = new stickerCollection();
        collection.fetch({
            success: function(stickers){
                var pgrRate = stickers.length * 0.1;
                for(var i = 0; i < stickers.length; i++){
                    if(UpdateSCProgressBar !== undefined)
                        UpdateSCProgressBar(pgrRate * i, true, "Retrieving Stickers");
                    stickers.push(ScrapStickers.create(stickers.models[i]));
                }
                if(callBack !== undefined)
                    callBack();
            },
            error: function(col, error){
                console.error("Can't retrieve stickers collection: " + error);
            }
        });
});