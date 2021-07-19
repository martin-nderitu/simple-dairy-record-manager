import {useEffect, useState, useCallback} from "react";
import log from "../../log";


interface PaginatorProps {
    totalItems: number;
    offset: number;
    limit: number;
    currentPage: number;
    pageLimits: (string | number)[];
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
}

interface UsePaginatorProps {
    totalItems: number;
    offset: number;
    limit: number;
    currentPage: number;
}

interface Pages {
    first?: number;
    prev?: number;
    next?: number;
    last?: number;
    pageList: (string | number)[];
}

function usePaginator (props: UsePaginatorProps) {
    const { totalItems, offset, limit, currentPage } = props;
    const [from, setFrom] = useState(1);
    const [to, setTo] = useState(1);
    const [pages, setPages] = useState<Pages>( { pageList: [] });
    const onEachSide = 3;

    const getPages = useCallback(() => {
        const totalPages = (Math.ceil(totalItems/limit));
        const pages: Pages = {pageList: []};
        const pageList: (string | number)[] = [];

        if (currentPage > 1) {
            pages.first = 1;
            pages.prev = currentPage - 1;
        }

        if (currentPage < totalPages) {
            pages.next = currentPage + 1;
            pages.last = totalPages;
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
            if (page > totalPages) { break; }
            pageList.push(page);
        }

        if (pageList.length) {
            const lastElement = pageList[pageList.length-1];
            if (lastElement && lastElement < totalPages) {
                pageList.push("...", totalPages);
            }
        }

        pages.pageList = pageList;
        log("\n\npage list = ", pageList, "\n\n");
        return pages;
    }, [totalItems, limit, currentPage, onEachSide]);

    useEffect(() => {
        setPages(getPages());
        setFrom(offset + 1);
        let to = offset + limit;
        to = to > totalItems ? totalItems : to;
        setTo(to);
    }, [getPages, offset, limit, totalItems]);


    return {
        from, to, totalItems, pages, currentPage, enablePagination: Math.ceil(totalItems/limit) > 1
    }

}

export default function Paginator ({pageLimits, handlePageChange, handleLimitChange, ...rest}: PaginatorProps) {
    const {from, to, totalItems, pages, currentPage, enablePagination} = usePaginator(rest);

    if (!enablePagination) { return null; }

    const handlePageClick = (page: any) => handlePageChange(page);

    const handlePageLimitChange = (event: any) => {
        const {value} = event.target;
        if (value) { handleLimitChange(value); }
    }

    const pageList = () => {
        return pages.pageList.map( (page: string | number) => {
            if (page === "...") {
                return (
                    <li key={page} className="page-item">
                        <span className="p-2">...</span>
                    </li>
                )
            }

            return (
                // @ts-ignore
                <li key={page} className={"page-item" + (page === parseInt(currentPage) ? " active" : "")}>
                    <button className="page-link" onClick={() => handlePageClick(page)}>{page}</button>
                </li>
            );
        });
    }

    const pageLimitOptions = () => {
        return (
            pageLimits.map( (limit) => <option key={limit} value={limit}>{limit.toString()}</option> )
        );
    }

    return (
        <div className="mb-3">
            <div className="row mb-3">
                <div className="col-12">
                    <nav className="float-md-start" aria-label="paginator">
                        <ul className="pagination" id="pager">
                            {pages.first &&
                                <li className="page-item">
                                    <button className="page-link"
                                            onClick={() => handlePageClick(1)}
                                    >First</button>
                                </li>
                            }

                            {pages.prev &&
                                <li className="page-item">
                                    <button className="page-link"
                                            onClick={() => handlePageClick(pages.prev)}
                                    >Prev</button>
                                </li>
                            }

                            {pageList()}

                            {pages.next &&
                                <li className="page-item">
                                    <button className="page-link"
                                            onClick={() => handlePageClick(pages.next)}
                                    >Next</button>
                                </li>
                            }

                            {pages.last &&
                                <li className="page-item">
                                    <button className="page-link"
                                            onClick={ () => handlePageClick(pages.last)}
                                    >Last</button>
                                </li>
                            }
                        </ul>
                    </nav>
                    <div className="float-md-end">
                        <label htmlFor="limit">Rows:</label>
                        <select
                            name="limit"
                            className="form-select-sm ms-2"
                            onChange={handlePageLimitChange}
                        >
                            {pageLimitOptions()}
                        </select>
                    </div>
                </div>
            </div>

            <div className="text-lg-start">
                Showing {from} to {to} of {totalItems} records
            </div>
        </div>
    );
}

