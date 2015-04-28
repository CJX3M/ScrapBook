var ScrapTemplates = [];
var ScrapTemplate = new Parse.Object.extend("ScrapTemplate", {
    name: '',
    user: {},
    data: {},
    Save: function(callback){
        this.save({
            Name: this.name,
            User: this.user,
            Data: JSON.stringify(this.data),
        },{
            error: function(_function, _error){
                console.error("Can't save template: " + error);
            },
        }).then(function(template){
            if(ScrapTemplates.indexOf(template) == -1)
                ScrapTemplates.push(template);
            if(callBack !== undefined)
                callBack();
        });
    }
}, {
    create: function(_temp){
        var temp = new ScrapTemplate();
        temp.id = _temp.id;
        temp.name = _temp.get("Name");
        temp.user = _temp.get("User");
        temp.data = JSON.parse(_temp.get("Data"));
        return temp;
    },
    getTemplates: function(callBack){
        var tempsCollection = Parse.Collection.extend({
            model: ScrapTemplate,
            query: (new Parse.Query(ScrapTemplate)).equalTo("ScrapUser", undefined)
        });
        var collection = new tempsCollection();
        collection.fetch({
            success: function(templates){
                var pgrRate = templates.length * 0.1;
                for(var i = 0; i < templates.length; i++){
                    if(UpdateSCProgressBar !== undefined)
                        UpdateSCProgressBar(pgrRate * i, true, "Retrieving Templates");
                    ScrapTemplates.push(ScrapTemplate.create(templates.models[i]));
                }
                if(callBack !== undefined)
                    callBack();
            },
            error: function(col, error){
                console.error("Can't retrieve templates collection: " + error);
            }
        });
    },
    getUserTemplates: function(callBack){
        var tempsCollection = Parse.Collection.extend({
            model: ScrapTemplate,
            query: (new Parse.Query(ScrapTemplate)).equalTo("ScrapUser", loggedUser)
        });
        var collection = new tempsCollection();
        collection.fetch({
            success: function(templates){
                var pgrRate = templates.length * 0.1;
                for(var i = 0; i < templates.length; i++){
                    if(UpdateSCProgressBar !== undefined)
                        UpdateSCProgressBar(pgrRate * i, true, "Retrieving Templates");
                    ScrapTemplates.push(ScrapTemplate.create(templates.models[i]));
                }
                if(callBack !== undefined)
                    callBack();
            },
            error: function(col, error){
                console.error("Can't retrieve templates collection: " + error);
            }
        });
    }
    
})