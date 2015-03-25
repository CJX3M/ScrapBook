var canvas;
var imageTransfer;
var addingText = false;
var elements = [];
var currentElementSelected;
var currentLoadedBook;
var currentPage;
var textStr;
var scrapBooks = [];

function initializeCanvas() {
    canvas = new fabric.Canvas('canvas');
    canvas.on("after:render", function(){ canvas.calcOffset() });
    canvas.on('mouse:down', function(options){
        if($("#addText").hasClass('active'))
            AddText(options);
    });
    canvas.on('object:added', function(e){
        elements.push(e.target);
    });
    canvas.on('object:removed', function(e){
        elements.pop(e.target);
    });
    canvas.on('object:selected', function(e){
        currentElementSelected = e.target;
    });
    var rect = new fabric.Rect({
        left: 20,
        top: 20,
        width: canvas.width * 0.95,
        height: canvas.height * 0.95,
        strokeWidth: 1, 
        stroke: 'rgba(0,0,0,1)',
        fill: 'rgba(0,0,0,0)',
        rx: 5, ry: 5,
        selectable: false,
        name: 'marco',
    });
    
    canvas.add(rect);
    var canvasContainer = document.getElementById('canvas-wrapper');
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
}

/* 
NOTE: the start and end handlers are events for the <img> elements; the rest are bound to the canvas container.
*/

function handleDragStart(e) {
    /*[].forEach.call(images, function (img) {
        img.classList.remove('img_dragging');
    });
    this.classList.add('img_dragging');*/
    imageTransfer = $(e.srcElement);
    imageTransfer.addClass('img_dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
    // NOTE: comment above refers to the article (see top) -natchiketa

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDrop(e) {    
    // this / e.target is current target element.

    /*
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    */
    
    e.stopPropagation(); // Stops some browsers from redirecting.
    e.preventDefault(); // Stops some browsers from redirecting.

    fabric.Image.fromURL($(imageTransfer).data("obj").source, function(img){
        canvas.add(img.set({left:e.layerX, top:e.layerY}));
        imageTransfer = null;
    });
    return false;
}

function handleDragEnd(e) {
    imageTransfer.removeClass('img_dragging');
}

function SetToggleButton(button){
    $(button).toggleClass('active');
}

function ToggleShadowOptions(button){
    $(button).toggleClass('active');
    $("#shadowTextOptions").toggle();
}

function SetText(button){
    $(button).toggleClass('active');
    canvas.defaultCursor = "crosshair";
    if($(button).hasClass('active'))
        textStr = prompt("Write text to insert and click on canvas qhere you want it!", textStr);
    else
        canvas.defaultCursor = "default";
}

function SetFont(option){
    $("#selFont").val($(option).text());
    $("#selFont").text($(option).text());
    $("#selFont").attr('style', $(option).attr('style'));
}

function AddText(options){
    var options = {
        left: options.e.layerX,
        top: options.e.layerY,
        fontWeight: $("#boldText").hasClass('active') ? 'bold' : 'normal',
        textDecoration: ($("#strokeText").hasClass('active') ? 'line-through' : '') + ($("#underlineText").hasClass('active') ? ' underline' : '') + ($("#overlineText").hasClass('active') ? ' overline' : ''),
        shadow: $("#shadowText").hasClass('active') ? ($("#shadowColor").val() || '#000000') + ' ' + ($("#txtShadowWidth").val() || '0') + 'px ' + ($("#txtShadowLeft").val() || '0') + 'px ' + ($("#txtShadowTop").val() || '0') + 'px' : '',
        fontStyle: $("#italicText").hasClass('active') ? 'italic' :  '',
        stroke: $("#outlineColor").val(),
        strokeWidth: $("#txtOutlineWidth").val(),
        fontFamily: $("#selFontFamily").val(),
        fill: $("#textColor").val(),
    };
    var text = new fabric.Text(textStr, options);
    canvas.add(text);
    $("#addText").removeClass('active');
    textStr = '';
    canvas.defaultCursor = "default";
}

function ListScrapbooks(){
    LoggedUser.ScrapBooks = ScrapBook.findBooks(LoggedUser.id);
    AddScrapBookToLst();
}

function AddScrapBookToLst(){
    var scrapLst = $("#scrapBookLst");
    scrapLst.html('');
    for(var i = 0; i < LoggedUser.ScrapBooks.length; i++) {
        var listItem = $("<li onclick='LoadBook(" + i + ")'>" + scrapBooks[index].Title + "</li>")
        scrapLst.append(listItem);
    }
}

function SavePage(){
    if(currentPage == null)
    {
        currentPage = new ScrapPage();
    }
    currentPage.data = JSON.stringify(canvas);
}

function SaveBook(){
    if(currentLoadedBook == null)
    {
        currentLoadedBook = new ScrapBook();
    }
    currentLoadedBook.AddPage(currentPage);
    currentLoadedBook.Save();
    ListScrapbooks();
}

function ClearPage(){
    var elemCount = canvas.getObjects().length;
    while(elemCount > 1)
    {
        var canvasElement = canvas.getObjects()[elemCount-1];
        if(canvasElement.name === undefined)
            canvas.remove(canvasElement);
        elemCount = canvas.getObjects().length;
    }
}