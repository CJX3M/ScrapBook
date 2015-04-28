function cuniq(index) {
    'use strict';
    var d = new Date(),
        m = d.getMilliseconds() + "",
        u = ++d + m + (index === 10000 ? (index = 1) : index);

    return u;
}

function ShowMessage (type, header, message, opt) {
    'use strict';
    if (arguments.length < 2) { return; }
    var buttonsDiv = $("<div id=\"alertButtons\"></div>"), timer, buttons;    
    switch(arguments.length){
        case 2: 
            message = header;
            header = "";
            break;
        case 3:
            if(typeof message !== "string")
            {
                if($.isPlainObject(message) || $.isArray(message))
                    buttons = message;
                else if($.isNumeric(message))
                {
                    timer = message;
                    buttons = undefined;
                }            
                message = header;
                header = "";
            }
            break;
        case 4: 
            if($.isNumeric(opt))
                timer = opt;
            else
                buttons = opt;
            break;
    }
    header = header !== "" ? "<h4>" + header + "</h4>" : "";
    var alert = $("<div class=\"alert alert-box alert-" + type + " alert-dismissible\" role=\"alert\">" +
                    "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>" +
                    header + message +
                  "</div>");    
    if(buttons !== undefined)
    {
        if ($.isArray(buttons)) {
            for (var i in buttons) {
                var button = $("<button type=\"button\" class=\"btn btn-" + buttons[i].type + "\">" + buttons[i].text + "</button>" );
                button.on("click", buttons[i].click);
                buttonsDiv.append(button);
            }
        } else {
            var button = $("<button type=\"button\" class=\"btn btn-" + buttons.type + "\">" + buttons.text + "</button>" );
            button.on("click", buttons.click);
            buttonsDiv.append(button);
        }
    }
    if (buttonsDiv.children().length > 0) {
        alert.append(buttonsDiv);
    }
    $("body").prepend(alert);
    if (timer !== undefined) {
        alert.css({"top": "calc(10%)", "left":"calc(80%)"})
        setTimeout(function(){
            alert.alert("close");
        }, timer);
    }
    alert.alert();
}

function SetCtlState (ctl, state) {
    'use strict';
    if(state) {
        ctl.addClass("active")
    } else { 
        ctl.removeClass("active");
    }
}