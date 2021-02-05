function getPages(currentPage, lastPage, onEachSide) {
    const pages = {}, pageList = [];
    if (currentPage > 1) {
        pages.first = 1;
        pages.prev = currentPage - 1;
    }

    if (currentPage < lastPage) {
        pages.next = currentPage + 1;
        pages.last = lastPage;
    }

    // pages on left of currentPage along with the current page
    if (currentPage > onEachSide) {   // to avoid negative pages
        for (let i = onEachSide; i >= 0; i--) { // >= ensures the current page is pushed
            pageList.push(currentPage - i)
        }
    } else {
        for (let i = 1; i <= currentPage; i++) {
            pageList.push(i);
        }
    }

    // pages on right of currentPage
    for (let i = 1; i <= onEachSide; i++) {
        let page = currentPage + i;
        if (page > lastPage) {
            break;
        }
        pageList.push(page);
    }

    pages.pageList = pageList;

    return pages;
}

function generatePaginator(paginator, lastPage, count, onEachSide=3) {
    paginator.pages = getPages(paginator.currentPage, lastPage, onEachSide);
    paginator.enablePagination = lastPage > 1;
    paginator.from = paginator.offset + 1;
    const to = paginator.offset + paginator.limit;
    paginator.to = to > count ? count : to;
    return paginator;
}

function paginator(req, res, next) {
    const currentPage = parseInt(req.query.page) || 1;    // the page clicked by the user
    const limit = parseInt(req.query.limit) || 5;   // items shown per page
    const offset = currentPage > 1 ? (currentPage - 1) * limit : 0; // items to skip in each page
    const path = req.baseUrl + req.path;
    res.locals.paginator = {currentPage, limit, offset, path};
    next();
}

export {
    getPages, paginator, generatePaginator
}