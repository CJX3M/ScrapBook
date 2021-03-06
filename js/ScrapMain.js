var canvas;
var canvasCurvedPreview;
var previewCurvText;
var imageTransfer;
var currentLoadedBook;
var currentPage;
var currentSelectedObject;
var currentObjectTarget;
var copiedObject;
var copiedObjects;
var cutObject;
var cutGroup;
var clipboardObject = false;

Parse.initialize("WbFkw1hALXfufg9GRO3C4lE4YEPveyB3BLZlkZKQ", "XAElZQL58DfkKoqDtgcmyr0gPlYAAeHO2RJcRljc");

$(window).load(function () {
    'use strict';
    initializeCanvas();
    loadFontsMethod = ListTextFonts;
    ScrapFont.getFonts(loadGoogleFonts)
    $('[data-toggle="tooltip"]').tooltip();
});

function initializeCanvas() {
    'use strict';
    canvas = new fabric.CanvasEx('canvas');
    canvasCurvedPreview = new fabric.Canvas('curvedTextPreview');
    UpdateSCProgressBar(40, "Setting Up Canvas");
    canvas.images = 0;
    canvas.texts = 0;
    canvas.stickers = 0;
    canvas.groups = 0;
    canvas.on("after:render", function () { canvas.calcOffset(); });
    canvasCurvedPreview.on("after:render", function () { canvasCurvedPreview.calcOffset(); });
    UpdateSCProgressBar();
    canvas.on('mouse:down', function (options) {
        if(options.target === undefined)
            options.target = {
                type: "canvas"
            };
        currentObjectTarget = options;
        if (options.e.which === 3)
            ShowContextMenu();
        else if ($("#addText").hasClass('active')) {
            ShowEditTextModal();
        }
    });
    UpdateSCProgressBar();
    canvas.on('object:added', function (e) {
        EnlistElements();
    });
    UpdateSCProgressBar();
    /*canvas.on('object:modified', function (e) {
        EnlistElements();
    });
    UpdateSCProgressBar();*/
    canvas.on('object:removed', function (e) {
        EnlistElements();
    });
    UpdateSCProgressBar();
    canvas.on('object:selected', function (e) {
        if (e.target.type === undefined || e.target.id === undefined) return;
        if (currentSelectedObject === undefined || currentSelectedObject.id !== e.target.id)
            HighlightElement(e.target.id);
    });
    ClearPage();
    UpdateSCProgressBar();
    var canvasContainer = document.getElementById('canvas-wrapper');
    UpdateSCProgressBar();
    canvasContainer.tabIndex = 1000;
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
    canvasContainer.addEventListener('contextmenu', function (e) {e.preventDefault(); return false;});
    UpdateSCProgressBar();
    canvasContainer.addEventListener('keydown', function (e) {
        console.log(e);
        var key;
        if (window.event) {
            key = window.event.keyCode;
        } else {
            key = e.keyCode;
        }        
        if (key === 123 || key === 116) return;
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        switch (key) {
                case 46:
                    DeleteSelectedElement();
                    break;
                // Copy (Ctrl+C)
                case 67: // Ctrl+C
                    if (event.ctrlKey) {
                        event.preventDefault();
                        Copy();
                    }
                    break;
                // Cut (Ctrl+X)
                case 88: // Ctrl+X
                    if (event.ctrlKey) {
                        event.preventDefault();
                        Cut();
                    }
                    break;
                // Paste (Ctrl+V)
                case 86: // Ctrl+V
                    if (event.ctrlKey) {
                        event.preventDefault();
                        Paste();
                    }
                    break;                
        }
    }, false);
    UpdateSCProgressBar();
    $(document).click(function (event) {
        if (!$(event.target).closest('#contextMenu').length) {
            if ($('#contextMenu').css("display") === "block") {
                $('#contextMenu').css("display", "none");
                currentObjectTarget = undefined;
            }
        }
    });
    UpdateSCProgressBar();
    $("#textContent").on("keydown", EnterMessage);
    NewBook();
}

/* 
NOTE: the start and end handlers are events for the <img> elements; the rest are bound to the canvas container.
*/

function handleDragStart(e) {
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

    fabric.Image.fromURL($(imageTransfer).data("obj").source, function (img){
        var x = e.layerX - img.width / 2;
        var y = e.layerY - img.height / 2;
        SetObjectId(img);
        canvas.add(img.set({left:x, top:y}));
        img.on('mousedown', function (options) {
            if (options.e.which === 3) {
                ShowContextMenu(options);
            }
        });
        imageTransfer = null;
    });
    return false;
}

function handleDragEnd(e) {
    imageTransfer.removeClass('img_dragging');
}

function EnterMessage(e) {
    var key;
    if (window.event) {
        key = window.event.keyCode;
    } else {
        key = e.keyCode;
    }        
    if (key === 123 || key === 116) { return; }
    if (key === 13 && e.shiftKey) {
        AddText();
    }
}

function SetObjectId(canvasObject) {
    canvasObject.id = canvasObject.type === "image" ? "I" + cuniq(++canvas.images) 
        : canvasObject.type === "sticker" ? "S" + cuniq(++canvas.stickers) 
        : canvasObject.type === "text" ? "T" + cuniq(++canvas.texts) 
        : canvasObject.type === "curvedText" ? "CT" + cuniq(++canvas.texts) 
        : canvasObject.type === "group" ? "G" + cuniq(++canvas.groups) : "";
}

function ToggleShadowOptions() {
    $("#shadowTextOptions").toggle();
}

function ToggleCurvedTextOptions() {
    $("#curvedTextOptions").toggle();
    if ($("#curvedTextOptions").is(":visible") && previewCurvText === undefined) {
        var params = {
            left: 0,
            top: 0,
            radius: 100,
            spacing: 10,
            reversed: false,
            textAlign: 'center'
        };
        
        previewCurvText = new fabric.CurvedText($("#textContent").val() !== "" 
                                                ? $("#textContent").val() 
                                                : 'Previsualizar', params);
        
        canvasCurvedPreview.add(previewCurvText).renderAll();

        $('.textAlign').change(function() {
            previewCurvText.set( $(this).attr('class').split(' ')[0], $(this).val() );
            canvasCurvedPreview.renderAll();
        });
        $('.radius, .spacing').on('slide', function() {
            previewCurvText.set( $(this).attr('class').split(' ')[0], $(this).val() );
            canvasCurvedPreview.renderAll();            
        })
        $('.reverse').change(function() {
            previewCurvText.set('reverse', $(this).is(':checked'));
            canvasCurvedPreview.renderAll();
        });
        $('#textContent').keyup(function() {
            previewCurvText.setText($(this).val(), GetTextParams());
            canvasCurvedPreview.renderAll();
        });
    }
}

function ListTextFonts() {
    var fontsLst = $("#selFontFamilyLst");
    for(var i = 0; i < ScrapFonts.length; i++){
        var listItem = $("<li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\" style=\"font-family:" + ScrapFonts[i].style + ";\""
                         + "onclick=\"SetFont(this);\">" + ScrapFonts[i].name + "</a></li>");
        fontsLst.append(listItem);
    }
    UpdateSCProgressBar(100, "Start Creating ScrapBooKs!!!!!!");
    setTimeout(function(){
        $(".SplashScreenBg").fadeOut('slow');
    }, 2500)
}

function SetText(button) {
    $(button).toggleClass('active');
    canvas.defaultCursor = $(button).hasClass('active') ? "crosshair" : "default";
}

function ShowEditTextModal(text) {
    $("#textContent").val("");
    if (text !== undefined){
        $("#textContent").val(text.text);
        SetCtlState($("#boldText").parent(), text.fontWeight === "bold");
        SetCtlState($("#strokeText").parent(), text.textDecoration.indexOf("line-through") !== -1);
        SetCtlState($("#underlineText").parent(), text.textDecoration.indexOf("underline") !== -1);
        SetCtlState($("#overlineText").parent(), text.textDecoration.indexOf("overline") !== -1);
        SetCtlState($("#strokeText").parent(), text.textDecoration.indexOf("line-through") !== -1);
        SetCtlState($("#shadowText").parent(), text.shadow !== '');
        SetCtlState($("#italicText").parent(), text.fontStyle === "italic");
        if (text.shadow !== undefined) {
            $("#shadowColor").val(text.shadow.color);
            $("#txtShadowWidth").val(text.shadow.blur);
            $("#txtShadowLeft").val(text.shadow.offsetX)
            $("#txtShadowTop").val(text.shadow.offsetY)
        }
        $("#outlineColor").val(text.stroke);
        $("#txtOutlineWidth").val(text.strokeWidth);
        SetFont($("#selFontFamilyLst").find("a:contains('" + text.fontFamily + "')"))
        $("#textColor").val(text.fill);
        $("#txtFontSize").val(text.fontSize);
    }
    $("#textOptions").on('shown.bs.modal', function () {
        $("#textContent").focus()
    })
    $("#textOptions").modal("show");
}

function SetFont(option) {
    $("#selFont").val($(option).text());
    $("#selFont").text($(option).text());
    $("#selFont").attr('style', $(option).attr('style'));
}

function AddText() {
    var textParams = GetTextParams();
    if (!$("#curvedTextOptions").is(":visible")) {
        var text = currentObjectTarget.target.type === "text" 
            ? currentObjectTarget.target 
            : new fabric.Text($("#textContent").val(), textParams);
    } else {
        var curvParams = {
            radius: $('.radius').val(),
            spacing: $('.spacing').val(),
            reversed: $('.reverse').val() == 'true',
            textAlign: $('.textAlign').val()
        };
        var text = currentObjectTarget.target.type === "curvedText" 
            ? currentObjectTarget.target 
            : new fabric.CurvedText($("#textContent").val(), curvParams);        
        text.set('left', currentObjectTarget.e.layerX - text.width / 2);
        text.set('top', currentObjectTarget.e.layerY - text.height / 2);
        text.setText($("#textContent").val(), textParams);
    }
    if (currentObjectTarget.target.type === "canvas") {
        SetObjectId(text);
        canvas.add(text);
        text.on('object:dblclick', function (options) {
            options.target = this;
            currentObjectTarget = options;
            ShowEditTextModal(options.target);
        });
    } else {
        var span = $("#elements").find("#" + canvas.getActiveObject().id + " > span");
        $("#elements").find("#" + canvas.getActiveObject().id).empty().append(span).append(" " + canvas.getActiveObject().text);
    }
    $("#addText").removeClass('active');
    $("#textOptions").modal("hide");
    canvas.defaultCursor = "default";
    canvas.renderAll();
}

function GetTextParams() {
    return {
        fontWeight: $("#boldText").parent().hasClass('active') ? 'bold' : 'normal',
        textDecoration: ($("#strokeText").parent().hasClass('active') ? 'line-through' : '') + 
        ($("#underlineText").parent().hasClass('active') ? ' underline' : '') + 
        ($("#overlineText").parent().hasClass('active') ? ' overline' : ''),
        shadow: $("#shadowText").parent().hasClass('active') ? ($("#shadowColor").val() || '#000000') + ' ' + 
        ($("#txtShadowWidth").val() || '0') + 'px ' + ($("#txtShadowLeft").val() || '0') + 'px ' + 
        ($("#txtShadowTop").val() || '0') + 'px' : '',
        fontStyle: $("#italicText").parent().hasClass('active') ? 'italic' :  '',
        stroke: $("#outlineColor").val(),
        strokeWidth: $("#txtOutlineWidth").val(),
        fontFamily: $("#selFont").val() || 'Arial',
        fill: $("#textColor").val(),
        fontSize: $("#txtFontSize").val()
    };
}

function ListScrapbooks() {
    ScrapBook.findBooks(LoggedUser, AddScrapBookToLst);    
}

function AddScrapBookToLst() {
    var scrapLst = $("#scrapBookLst");
    scrapLst.html('');
    for(var i = 0; i < LoggedUser.ScrapBooks.length; i++) {
        var listItem = $("<a href=# class='list-group-item' onclick='LoadBook(" + i + ")'>" +
                         "<span class='glyphicon glyphicon-book' aria-hidden='true'></span> " + LoggedUser.ScrapBooks[i].Title + "</a>")
        scrapLst.append(listItem);
    }
}

function NewBook() {
    if (currentLoadedBook === null || currentLoadedBook === undefined) {
        currentLoadedBook = new ScrapBook();
        currentLoadedBook.user = LoggedUser;
        currentLoadedBook.pages = [];
        currentLoadedBook.title = '';
        AddPage();
    }
    currentLoadedBook.AddPage(currentPage);
    CreatePageSelector();
    LoadPage(1);
}

function AddPage() {
    SavePage();
    currentPage = new ScrapPage();
    currentLoadedBook.AddPage(currentPage);
    AddPageToSelector(currentPage.pageNo);
    LoadPage(currentPage.pageNo);
}

function SavePage() {
    if (currentPage !== null && currentPage !== undefined) {
        currentPage.data = JSON.stringify(canvas);
        if (currentPage.ScrapBook === null || currentPage.ScrapBook === undefined)
            currentPage.ScrapBook = currentLoadedBook;
        currentPage.Save();
    }
}

function SaveBook() {
    if(currentLoadedBook === null || currentLoadedBook === undefined)
        NewBook();    
    currentLoadedBook.Save(ListScrapbooks);
}

function DeleteSelectedElement() {
    if (canvas.getActiveGroup()){
        canvas.getActiveGroup().forEachObject(function (o){ canvas.remove(o) });
        canvas.discardActiveGroup().renderAll();
    } else {
        canvas.remove(canvas.getActiveObject());
        canvas.discardActiveObject();
    }                        
}

function ClearPage() {
    canvas.clear();
/*    var rect = new fabric.Rect({
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
    
    canvas.add(rect);*/
}

function DeletePage() {
    if (currentPage !== null || currentPage !== undefined) {
        if(currentLoadedBook.pages.length === 1)
            ClearPage();
        else {
            currentLoadedBook.RemovePage(currentPage);
            CreatePageSelector();
            var removedPageNo = currentPage.pageNo;
            delete currentPage;
            LoadPage(removedPageNo - 1);
        }
   }
}

function LoadBook(index) {
    currentLoadedBook = LoggedUser.ScrapBooks[index];
    CreatePageSelector();
    if (currentLoadedBook.pages.length > 0)
        LoadPage(1);
}

function LoadPage(index) {
    if (index <= 0)
        index = 1;
    SavePage();
    currentPage = currentLoadedBook.pages[index - 1];
    $("#selPage").text(index);
    canvas.loadFromJSON(currentPage.data, function (){
        canvas.renderAll();
    });
}

function CreatePageSelector() {
    $("#selPageMenu").empty();
    $("#selPage").text('');
    for(var i = 0; i < currentLoadedBook.pages.length; i++)
    {
        AddPageToSelector(i + 1);
    }    
}

function AddPageToSelector(index) {
    var pageNo = $("<li><a href='#' onclick='LoadPage(" + index + ")'>" + index + "</a></li>")
    $("#selPageMenu").append(pageNo);
}

function EnlistElements() {
    var elements = $("#elements");
    elements.empty();
    canvas.forEachObject(function (element){
        if (element.type === "rect") return;
        var type = element.type === 'image' ? 'camera' : element.type === 'text' ? 'font' : element.type === 'group' ? '' : 'picture';
        var texto = element.type === 'image' || element.type === 'group' ? element.type : element.type === 'text' ? element.text : 'Sticker';
        var newItem = $("<a href=# class='list-group-item' id='" + element.id + "' onclick='HighlightElement(" + element.id + ")'>" + 
                         "<span class='glyphicon glyphicon-" + type + "' aria-hidden='true'></span> " + texto + "</a>");
        elements.append(newItem);        
    })
}

function HighlightElement(element) {
    if (typeof element === 'string')
        element = $("#" + element);
    var elements = $("#elements");
    elements.find("a").removeClass('active');
    $(element).addClass('active');
    canvas.forEachObject(function (object){
        if (object.id !== undefined && object.id === element.id)
        {
            currentSelectedObject = object;
            if (object.type === 'group')
                canvas.setActiveGroup(object);
            else
                canvas.setActiveObject(object);
            return;
        }
    })
}

function ShowContextMenu() {
    var contextMenu = $("#contextMenu");
    contextMenu.on('contextmenu', function(e){
        e.stopPropagation();
        // Your code.
        return false;
    });
    contextMenu.find("li").removeClass("disabled");    
    contextMenu.find("optMoveFwd").show();
    contextMenu.find("optMoveBck").show();
    contextMenu.find("optBringFwd").show();
    contextMenu.find("optSendBck").show();  
    contextMenu.find(".divider").show();
    switch(currentObjectTarget.target.type) {
        case "rect":
            contextMenu.find("li").addClass("disabled");
            break;
        case "text":
        case "curvedText":
            contextMenu.find("#optEditText").show();
            contextMenu.find("#optGroup").hide();
            contextMenu.find("#optUngroup").hide();
            contextMenu.find(".divider:first").hide();
            contextMenu.find(".divider:last").show();
            break;
        case "image": 
            contextMenu.find("#optEditText").hide();
            contextMenu.find("#optGroup").hide();
            contextMenu.find("#optUngroup").hide();
            contextMenu.find(".divider:first").hide();
            contextMenu.find(".divider:last").show();
            break;
        case "group": 
            contextMenu.find("#optEditText").hide();
            contextMenu.find("#optGroup").show();
            contextMenu.find("#optUngroup").show();
            contextMenu.find(".divider:first").show();
            contextMenu.find(".divider:last").hide();            
            break;
        default:
            contextMenu.find("#optEditText").hide();
            contextMenu.find("#optGroup").hide();
            contextMenu.find("#optUngroup").hide();
            contextMenu.find("#optMoveFwd").hide();
            contextMenu.find("#optMoveBck").hide();
            contextMenu.find("#optBringFwd").hide();
            contextMenu.find("#optSendBck").hide();
            contextMenu.find(".divider").hide();
            break;
    }
    if (!clipboardObject)
        contextMenu.find("#optPaste").parent().addClass("disabled");
    else
        contextMenu.find("#optPaste").parent().removeClass("disabled");
    contextMenu.css({'top': currentObjectTarget.e.clientY, 'left': currentObjectTarget.e.clientX+5}).show();
}

function ContextMenuOpt(option) {
    $("#contextMenu").hide();
    switch(option){
            case "copy": 
                Copy();
                break;
            case "cut":
                Cut();
                break;
            case "paste":
                Paste();
                break;
            case "group":
                CreateGroup();
                break;
            case "ungroup": 
                DisbandGroup();
                break;
            case "edit": 
                ShowEditTextModal(currentObjectTarget.target);
                break;
            case "movefwd":
                MoveForward();
                break;
            case "movebwd":
                MoveBackward();
                break;
            case "tofrnt": 
                BringToFront();
                break;
            case "tobk": 
                SendToBack();
                break;
    }
    currentObjectTarget = undefined;
}

function CreateGroup() {
    if (canvas.getActiveGroup()){
        var group = new fabric.Group();
        canvas.getActiveGroup().forEachObject(function (o){
            var object = fabric.util.object.clone(o);
            var index = canvas.getObjects().indexOf(o);
            object.set({
                top: o.originalTop,
                left: o.originalLeft,
                hasControls: false,
                hasBorders: false,
                active: false,                
            });
            canvas.remove(o);
            group.addWithUpdate(object);
            object.moveTo(index);
        });
        canvas.discardActiveGroup();
        SetObjectId(group);
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
    }
    else
        ShowMessage("warning", "", "Select the items you want to group.");
}

function DisbandGroup() {
    if (canvas.getActiveObject().type !== "group"){
        ShowMessage("warning", "", "Only group type items can be ungrouped.");
        return;
    }
    canvas.getActiveObject().forEachObject(function (o){
        var object = fabric.util.object.clone(o);
        var index = canvas.getActiveObject().getObjects().indexOf(o);
        object.set({
            top: canvas.getActiveObject().top + o.top,
            left: canvas.getActiveObject().left + o.left,
            hasControls: true,
            hasBorders: true,
            active: false,
        });
        canvas.add(object);
        object.moveTo(index);
    });
    DeleteSelectedElement();
}

function Copy() {
    if (canvas.getActiveGroup()){
         canvas.getActiveGroup().forEachObject(function (o){
            var object = fabric.util.object.clone(o);
            object.set("top", object.top+5);
            object.set("left", object.left+5);
            copiedObjects[i] = object;
        });
        clipboardObject = true;
    }
    else if (canvas.getActiveObject()){
        var object
        if (canvas.getActiveObject().type === "group")
        {
            object = new fabric.Group();
            canvas.getActiveObject().forEachObject(function (o){
                var clone = fabric.util.object.clone(o);
                SetObjectId(clone);
                object.add(clone);
            });
            
        }
        else
        {
            object = fabric.util.object.clone(canvas.getActiveObject());
        }
        object.set("top", object.top+5);
        object.set("left", object.left+5);
        copiedObject = object;
        copiedObjects = new Array();
        clipboardObject = true;
    }
}

function Cut() {
    canvas.forEachObject(function (o){
        o.setOpacity(1);
    })
    cutGroup = null;
    cutObject = null;
    if (canvas.getActiveGroup()){
        canvas.getActiveGroup().setOpacity(0.5);
        cutGroup = canvas.getActiveGroup();
        clipboardObject = true;
    }
    else if (canvas.getActiveObject()){
        canvas.getActiveObject().setOpacity(0.5);
        cutObject = canvas.getActiveObject();
        clipboardObject = true;
    }
    canvas.renderAll();
}

function Paste() {
    if (cutObject){
        cutObject.setOpacity(1);
        canvas.setActiveObject(cutObject);
        Copy();
        canvas.remove(cutObject);
        cutObject = undefined;
        Paste();
        return;
    }
    else if (cutGroup){
        cutGroup.setOpacity(1);
        canvas.setActiveGroup(cutGroup);
        Copy();
        canvas.remove(cutGroup);
        cutGroup = undefined;
        Paste();
        return;
    }
    else if (copiedObjects.length > 0){
        for(var i in copiedObjects){
            copiedObject = copiedObjects[i];
            AddCopiedObject();
        }
    }
    else if (copiedObject){
        AddCopiedObject();
    }
    canvas.renderAll();    
}
    
function AddCopiedObject() {
    if (currentObjectTarget !== undefined && currentObjectTarget.e !== undefined){
        copiedObject.set({
            top: currentObjectTarget.e.layerY,
            left: currentObjectTarget.e.layerX
        });
    }
    SetObjectId(copiedObject);
    canvas.add(copiedObject);
}

function MoveForward() {
    if (canvas.getActiveGroup())
        canvas.getActiveGroup().bringForward();
    else
        canvas.getActiveObject().bringForward();
}

function MoveBackward() {
    if (canvas.getActiveGroup())
        canvas.getActiveGroup().sendBackwards();
    else
        canvas.getActiveObject().sendBackwards();
}

function BringToFront() {
    if (canvas.getActiveGroup())
        canvas.getActiveGroup().bringToFront();
    else
        canvas.getActiveObject().bringToFront();
    canvas.renderAll();
}

function SendToBack() {
    if (canvas.getActiveGroup())
        canvas.getActiveGroup().sendToBack();
    else
        canvas.getActiveObject().sendToBack();
    canvas.renderAll();
}

function UpdateSCProgressBar(pctg, add, msg){
    if (arguments.length === 1) {
        if(typeof pctg === "string") {
            msg = pctg;
            pctg = undefined;
        }
    } else if (arguments.length === 2) { 
        if(typeof add === "string") {
            msg = add;
            add = undefined;
        }
    }
    if(pctg === undefined){
        pctg = $(".SplashScreen").find(".progress-bar").css("width").replace("px", "");
        pctg++;
    }
    if(add !== undefined && add){
        pctg = $(".SplashScreen").find(".progress-bar").css("width").replace("px", "") + pctg;
    }
    if(msg !== undefined){
        $(".SplashScreen").find(".progress-bar").find("span").text(msg);
    }
    $(".SplashScreen").find(".progress-bar").css("width", pctg + "%")
}

function GetObjectPos(object) {
    if(object === undefined)
        object = canvas.getActiveObject();
    if(object.type === "group") {
        console.log("Top: " + object.top + " Left: " + object.left + " Width: " + object.width + " Height: " + object.height);
        object.forEachObject(function (o) {
            console.log("Id: " + o.id + " Top: " + o.top + " Left: " + o.left + " Width: " + o.width + " Height: " + o.height);        
        });
    } else {
        console.log("Id: " + object.id + " Top: " + object.top + " Left: " + object.left + " Width: " + object.width + " Height: " + object.height);                
    }
}