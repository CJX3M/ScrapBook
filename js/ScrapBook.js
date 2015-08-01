var ScrapBook = Parse.Object.extend("Scrapbook", {
    title: '',
    user : {},
    pages: [],
    AddPage: function(page) {
        if(page.pageNo === 0)
        {
            this.pages.push(page);
            page.ScrapBook = this;
            page.pageNo = this.pages.length;
        }
    },
    RemovePage: function(page) {
        this.pages.splice(page.pageNo - 1, 1);
        for(var i = 0; i < this.pages.length; i++) {
            this.pages[i].pageNo = i + 1;   
        }  
    },
    Save: function(callBack) {
        this.save({
            Title: this.title,
            ScrapUser: this.user != null ? this.user : LoggedUser,
        }, {
            success: function(_scrap){
                console.log(_scrap.id)
                for(var i = 0; i < _scrap.pages.length; i++){
                    _scrap.pages[i].ScrapBook = _scrap;
                    _scrap.pages[i].Save();
                }
                if(callBack !== undefined)
                    callBack();
            },
            error: function(_scrap, error){
                console.error("Failed to save book: " + error);
            }
        });
    },    
},{
    create: function(_scrap) {
        var scrapBook = new ScrapBook();
        scrapBook.id = _scrap.id;
        scrapBook.title = _scrap.get('Title');
        scrapBook.user = _scrap.get('ScrapUser');
        ScrapPage.findPages(scrapBook);
        return scrapBook;
    },
    findBook: function(scrapId) {
        var query = Parse.Query(ScrapBook);
        return query.get(scrapId, {
            success: function(_scrap){
                var scrapBook = ScrapBook.create(_scrap);
                return scrapBook;
            }
        })
    },
    findBooks: function(loggedUser, listMethod) {
        loggedUser.ScrapBooks = [];
        var query = new Parse.Query(ScrapBook);
        query.equalTo("ScrapUser", loggedUser);
        return query.find().then(function(results) {
            var pgrRate = results.length * 0.1;
            for(var i = 0; i < results.length; i++) {
                if(UpdateSCProgressBar !== undefined)
                    UpdateSCProgressBar(pgrRate * i, true, "Retrieving User ScrapBooKs");
                loggedUser.ScrapBooks.push(ScrapBook.create(results[i]));
            }
            if(loggedUser.ScrapBooks.length > 0 && listMethod !== undefined)
                listMethod();
        },function(error) {
            console.error("Failed to retrieve user books: " + error);
        });
    }
});
