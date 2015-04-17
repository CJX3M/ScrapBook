var ScrapPage = Parse.Object.extend("ScrapPage", {
    data: '',
    pageNo: 0,
    modified: false,
    locked: false,
    ScrapBook: {},
    modifications: [],
    Save: function(){
        this.save({
            ScrapBook: this.ScrapBook,
            ScrapPageData: this.data,
            PageNo: this.pageNo,
            Locked: this.locked,
            Modified: this.modified
        }, {
            error: function(_scrap, error){
                console.error("Failed to save book: " + error);
            }
        });
    }    
}, {
    create: function(_page){
        var scrapPage = new ScrapPage();
        scrapPage.id = _page.id;
        scrapPage.data = _page.get('ScrapPageData');
        scrapPage.pageNo = _page.get('PageNo');
        scrapPage.modified = _page.get('Modified');
        scrapPage.locked = _page.get('Locked');
        scrapPage.ScrapBook = _page.ScrapBook !== undefined ? _page.ScrapBook : ScrapBook.findBook(_page.get('ScrapBook'));
        //scrapPage.elements = [];
        scrapPage.modifications = [];
        return scrapPage;
    },
    findPages: function(scrapBook){
        var query = new Parse.Query(ScrapPage);
        query.equalTo("ScrapBook", scrapBook);
        /*var pages = query.collection();
        scrapBook.pages = [];
        for(var i = 0; i < pages.length; i++)
        {
            pages[i].ScrapBook = scrapBook;
            scrapBook.pages.push(ScrapPage.create(pages[i]));
        }*/
        return query.find({
            success: function(results){
                scrapBook.pages = [];
                for(var i = 0; i < results.length; i++)
                {
                    results[i].ScrapBook = scrapBook;
                    scrapBook.pages.push(ScrapPage.create(results[i]));
                }
            },
            error: function(results, error){
                console.error("Error retrievingn the pages: " + error);
                return [];
            }
        })
    },
});