var Pagination = function (page, limit, pages) {
    // defaults
    this.page = 1;
    this.limit = 10;
    this.pages = 1;
    this.navs = [];
    this.sort = {};

    this.navigate(page, limit, pages);
    return this;
};

Pagination.prototype.setSort = function(sort) {
    this.sort = sort || this.sort;
    return this;
};

Pagination.prototype.navigate = function(page, limit, pages) {
    this.page = page || this.page;
    this.limit = limit || this.limit;
    this.skip = (this.page -1) * this.limit;

    this.pages = pages || this.pages;

    this._refresh(); // add navs
    return this;
};

Pagination.prototype._refresh = function() {
    this.navs = [];
    this.navs.push({
        title: '<<',
        page: 1,
    });
    this.navs.push({
        title: 'prev',
        page: +this.page-1
    });
    this.navs.push({
        title: 'next',
        page: +this.page+1
    });
    this.navs.push({
        title: '>>',
        page: +this.pages
    });
};

module.exports = Pagination;
