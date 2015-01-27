var canvas;
var imageTransfer;

function initializeCanvas() {
    canvas = new fabric.Canvas('canvas');
    canvas.on("after:render", function(){ canvas.calcOffset() });
    var rect = new fabric.Rect({
        left: 20,
        top: 20,
        width: canvas.width * 0.95,
        height: canvas.height * 0.95,
        strokeWidth: 1, 
        stroke: 'rgba(0,0,0,1)',
        fill: 'rgba(0,0,0,0)',
        rx: 5, ry: 5,
        selectable: false
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