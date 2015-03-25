var ScrapPage = Parse.Object.extend("ScrapPage", {
    data: '',
    pageNo: 0,
    modified: false,
    locked: false,
    ScrapBook: {},
    modifications: [],
    Save: function(){
        this.save({
            ScrapBook: this.ScrapBook.id,
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
        scrapPage.data = _page.get('ScrapPageData');
        scrapPage.pageNo = _page.get('PageNo');
        scrapPage.modified = _page.get('Modified');
        scrapPage.locked = _page.get('Locked');(
        scrapPage.ScrapBook = new ScrapBook().findBook(_page.get('ScrapBook'));
        //scrapPage.elements = [];
        scrapPage.modifications = [];
        return scrapPage;
    },
    findPages: function(id){
        var query = new Parse.Query(ScrapPage);
        query.equalsTo("ScrapBook", id);
        return query.find({
            success: function(results){
                var pages = [];
                for(var i = 0; i < results.length; i++)
                {
                    pages.push(ScrapPage.create(results[i]));
                }
                return pages;
            },
            error: function(results, error){
                console.error("Error retrievingn the pages: " + error);
                return [];
            }
        })
    },
});