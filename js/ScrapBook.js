var ScrapBook = Parse.Object.extend("Scrapbook", {
    title: '',
    user : {},
    pages: [],
    AddPage: function(page) {
        if($.inArray(this.pages, page))
        {
            this.pages.push(page);
            page.ScrapBook = this;
            page.pageNo = this.pages.length;
        }
    },
    Save: function() {
        this.save({
            Title: this.title,
            ScrapUser: this.user != null ? this.user.id : LoggedUser.id,
        }, {
            success: function(_scrap){
                console.log(_scrap.id)
                for(var i = 0; i < this.pages.length; i++){
                    this.pages[i].ScrapBook = _scrap;
                    this.pages[i].Save();
                }                
            },
            error: function(_scrap, error){
                console.error("Failed to save book: " + error);
            }
        });
    },    
},{
    create: function(_scrap) {
        var scrapBook = new ScrapBook();
        scrapBook.title = _scrap.get('Title');
        scrapBook.user = _scrap.get('ScrapUser');
        scrapBook.pages = ScrapPage.findPages(scrapBook.id);
        return scrapBook;
    },
    findBook: function(scrapId) {
        var query = Parse.Query(ScrapBook);
        return query.get(scrapId, {
            success: function(_scrap){
                var scrapBook = new ScrapBook();
                return scrapBook.create(_scrap);
            }
        })
    },
    findBooks: function(userId) {
        var query = new Parse.Query(ScrapBook);
        query.equalsTo("ScrapUser", userId);
        return query.find().then(function(results) {
            var books = []
            for(var i = 0; i < results.length; i++){
                books.push(ScrapBook.create(results[i]));
            }
            return books;
        },function(error) {
            console.error("Failed to retrieve user books: " + error);
            return [];
        });
    }
});
