Parse.initialize("WbFkw1hALXfufg9GRO3C4lE4YEPveyB3BLZlkZKQ", "XAElZQL58DfkKoqDtgcmyr0gPlYAAeHO2RJcRljc");

var currentFont;

$(window).load(function(){
    LoadFontsLst();
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