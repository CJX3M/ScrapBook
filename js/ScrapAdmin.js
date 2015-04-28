Parse.initialize("WbFkw1hALXfufg9GRO3C4lE4YEPveyB3BLZlkZKQ", "XAElZQL58DfkKoqDtgcmyr0gPlYAAeHO2RJcRljc");

var currentFont, currentSticker;

$(window).load(function(){
    LoadFontsLst();
    LoadStickers();
})

function SaveFont(){
    if(currentFont === undefined) {
        currentFont = new ScrapFont();
    }
    currentFont.name = $("#txtFontName").val();
    currentFont.family = $("#txtFontFamily").val();
    currentFont.style = $("#txtFontStyle").val();
    currentFont.Save(EnlistFonts);
    NewFont();
}

function LoadFontsLst() {
    loadFontsMethod = EnlistFonts;
    ScrapFont.getFonts(loadGoogleFonts);
}

function EnlistFonts() {
    var fontsLst = $("#fontLst");
    $("#fontLst").empty();
    for(var i = 0; i < ScrapFonts.length; i++){
        var listItem = $("<a href=# class=\"list-group-item\" onclick=\"LoadFont(" + i + ")\">" +
                         "<span  style=\"font-family:" + ScrapFonts[i].style + "\">" + ScrapFonts[i].name + "</span></a>")
        fontsLst.append(listItem);        
    };

}

function NewFont(){
    currentFont = new ScrapFont();
    $("#txtFontName").val('');
    $("#txtFontFamily").val('');
    $("#txtFontStyle").val('');
}

function LoadFont(index){
    currentFont = ScrapFonts[index];
    $("#txtFontName").val(currentFont.name);
    $("#txtFontFamily").val(currentFont.family);
    $("#txtFontStyle").val(currentFont.style);    
}

function SaveSticker(){
    if(currentSticker === undefined) {
        currentSticker = new ScrapSticker();
    }
    currentSticker.name = $("#txtStickerTitle").val();
    currentSticker.url = $("#txtStickerUrl").val();
    currentSticker.Save(EnlistStickers);
    NewSticker();
}

function LoadStickerLst() {
    ScrapSticker.getStickers(EnlistStickers)
}

function EnlistStickers() {
    var stickerLst = $("#stickerLst");
    $("#stickerLst").empty();
    for(var i = 0; i < ScrapSticker.length; i++){
        $("<img src=\"" +  ScrapSticker[i].url + "\" alt=\"" +  ScrapSticker[i].title + "\">").load(function(){
            $(this).css(getSizeAdjust($(this)));
            var listItem = $("<a href=# class=\"list-group-item\" onclick=\"LoadSticker(" + i + ")\"></a>");
            listItem.append($(this));
            listItem.append("<span>" + ScrapSticker[i].title + "</span>");
            stickerLst.append(listItem);
        });
    };

}

function NewSticker(){
    currentSticker = new ScrapFont();
    $("#txtStickerTitle").val('');
    $("#txtStickerUrl").val('');
}

function LoadSticker(index){
    currentSticker = ScrapSticker[index];
    $("#txtStickerTitle").val(currentSticker.title);
    $("#txtStickerUrl").val(currentSticker.url); 
}

function getSizeAdjust(image){
    var style = "'width': 'calc(100% - 40px)','height': 'auto'";
    if(image.width() < image.height())
        style = "'height': 'calc(100% - 30px)''width': 'auto'";
    return style;
}