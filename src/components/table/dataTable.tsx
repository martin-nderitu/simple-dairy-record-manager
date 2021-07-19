import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import Table from "./table";
import Paginator from "./paginator";
import Spinner from "../spinners/spinner";
import Alert from "../alert";
import Actions from "./actions";
import {Pagination} from "../types";
import log from "../../log";
import {generateQuery} from "../utils";


interface DataTableProps {
    data: any [] | null;
    pagination: Pagination | null;
    cols: any [];
    message: {type: string; message: string} | null,
    setMessage: any;
    isLoading: boolean;
    title: string;
    selection?: boolean;
    createLink?: string;
    pageLimits?: (string | number)[];
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setDestroyed: React.Dispatch<React.SetStateAction<boolean>>;
    searchForm: () => ({handleSearchForm}: {handleSearchForm: (values: {[k: string]: string}) => void}) => JSX.Element;
    destroyCallback: (query: string) => Promise<{data: any, ok: any, status: any} | undefined>;
}


export default function DataTable (props: DataTableProps) {
    const {
        data, pagination, cols, message, setMessage, isLoading, title,
        setQuery, setDestroyed, searchForm, destroyCallback,
        createLink: createLink = null,
        selection: selection = true,
        pageLimits: pageLimits = [5, 10, 15, 25, 50, "all"]
    } = props;
    const firstRender = useRef(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<(number | string)>(5);
    const [searchFormValues, setSearchFormValues] = useState<{[k: string]: string}>({});
    const [checked, setChecked] = useState<string[]>([]);
    const SearchForm = searchForm();

    useEffect(() => log("\n\nsearch form values = ", searchFormValues, "\n\n"),[searchFormValues]);

    useEffect(() => setPage(1),[searchFormValues, limit]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const queryObject = { ...searchFormValues, page, limit }
        const query = generateQuery(queryObject);
        setQuery(query);
    },[page, limit, searchFormValues]);

    const handlePageChange = (page: number) => setPage(page);

    const handleLimitChange = (limit: (number | string)) => setLimit(limit);

    const handleSearchForm = (values: {[k: string]: string}) => setSearchFormValues({...values});

    const handleDestroy = async () => {
        try {
            const response = await destroyCallback(checked.join(","));
            log("\n\ndestroy response = ", response, "\n\n");
            if (response?.ok) {
                const message = { type: "success", message: response.data.message };
                setMessage(message);
                setDestroyed(true);
            } else {
                const message = {type: "danger", message: response?.data.error};
                setMessage(message);
            }
        } catch (error) {
            log("\n\nerror in handle destroy ", error, "\n\n");
        }
    }

    return (
        <div className="container-fluid pt-3">
            { message && (
                <div className="pb-1">
                    <Alert message={message} setMessage={setMessage} />
                </div>
            )}
            <div className="card shadow-lg rounded-0">
                <div className="card-header text-white bg-success rounded-0">
                    <h4 className="text-lg-start float-md-start">{title}</h4>

                    {createLink ?
                        <Link to={createLink} className="btn btn-primary float-md-end rounded-0">Create</Link>
                        : null
                    }

                    <div className="row col-12">
                        <SearchForm handleSearchForm={handleSearchForm}/>
                    </div>

                    <div className="row col-12">
                        {checked.length ? <Actions actions={{
                        rows: checked.length,
                        destroy: {
                            handleDestroy,
                            modalTitle: `Delete ${title}`,
                            modalBody: `You are about to delete ${checked.length} ${title.toLowerCase()}(s). This action cannot be undone.`
                        }

                    }} /> : null }
                    </div>
                </div>

                <div className="card-body">
                    {isLoading ? <Spinner/> :
                        <>
                            {data ?
                                <Table
                                    cols={cols}
                                    data={data}
                                    handleChecked={setChecked}
                                    selection={selection}
                                />
                                : <h3 className="text-center">No results found</h3>
                            }
                        </>
                    }
                </div>

                {data && pagination ?
                    <div className="card-footer border-white">
                        <Paginator
                            totalItems={pagination.count}
                            offset={pagination.offset}
                            limit={pagination.limit}
                            currentPage={pagination.currentPage}
                            pageLimits={pageLimits}
                            handlePageChange={handlePageChange}
                            handleLimitChange={handleLimitChange}
                        />
                    </div>
                    : null
                }
            </div>
        </div>
    );
}
