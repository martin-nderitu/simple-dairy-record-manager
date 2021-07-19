import {useEffect, useState, useCallback, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {Admin} from "../api";
import DataTable from "../table/dataTable";
import {useForm} from "../form/form";
import {Select, DateTimeInput} from "../form/inputs";
import {Pagination, Message, ViewManyProps, SearchFormProps} from "../types";
import log from "../../log";


function SearchForm({handleSearchForm}: SearchFormProps) {
    const { handleSubmit, setValuesAndTouched, ...attrs } = useForm({
        initialValues: useMemo(() => ({ shift: "", from: "", to: "" }),[]),
        onSubmit: ({values}) => {
            handleSearchForm(values);
        },
    });

    return (
        <div className="container-fluid pt-3">
            <form className="row gy-2 gx-3 align-items-center" onSubmit={handleSubmit}>
                <Select
                    label="Shift"
                    name="shift"
                    inline={true}
                    options={[ {value: "", label: "Select shift..."}, "morning", "afternoon", "evening"] }
                    // @ts-ignore
                    attrs={attrs}
                />

                <DateTimeInput
                    label="From"
                    name="from"
                    placeholder="Date from..."
                    inline={true}
                    // @ts-ignore
                    attrs={attrs}
                    setValuesAndTouched={setValuesAndTouched}
                    options={{
                        defaultHour: 0,
                        defaultMinute: 0,
                    }}
                />

                <DateTimeInput
                    label="To"
                    name="to"
                    placeholder="Date to..."
                    inline={true}
                    // @ts-ignore
                    attrs={attrs}
                    setValuesAndTouched={setValuesAndTouched}
                    options={{
                        defaultHour: 23,
                        defaultMinute: 59,
                    }}
                />

                <div className="col-auto">
                    <button type="submit" className="btn btn-primary rounded-0">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default function RecordsView({createLink, selection, cols, fetchCallback}: ViewManyProps) {
    const [records, setRecords] = useState<any[] | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [query, setQuery] = useState("");
    const [destroyed, setDestroyed] = useState(false);
    const location: any = useLocation();

    const getLocationStateMessage = useCallback(() => {
        if (location?.state?.message) { setMessage(location.state.message) }
    }, [location]);

    useEffect(() => { getLocationStateMessage(); }, [getLocationStateMessage]);

    useEffect(() => {
        log("\n\nrecords query = ", query,"\n\n");
        (async () => { await fetchRecords(); })();
    }, [query]);

    useEffect(() => {
        if (destroyed) {
            (async () => { await fetchRecords(); })();
            setDestroyed(false);
        }
    },[destroyed]);

    useEffect(() => { if (message) { window.scrollTo(0, 0) } }, [message]);

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            const response = await fetchCallback(query);
            log("\n\nfetch records response = ", response, "\n\n");
            if (response?.ok) {
                const {records, pagination} = response?.data;
                setRecords(records);
                setPagination(pagination);
                setIsLoading(false);
            } else {
                const error = { type: "danger", message: response?.data.error };
                // @ts-ignore
                setRecords(null);
                setPagination(null);
                setIsLoading(false);
                log("\n\nerror fetching records = ", error, "\n\n");
            }
        } catch (error) {
            log("\n\nerror fetching records = ", error, "\n\n");
        }
    }

    return (
        <DataTable
            data={records}
            pagination={pagination}
            cols={cols}
            message={message}
            setMessage={setMessage}
            setDestroyed={setDestroyed}
            setQuery={setQuery}
            isLoading={isLoading}
            title="Milk Records"
            selection={selection}
            createLink={createLink}
            searchForm={useCallback(() => SearchForm, [])}
            destroyCallback={(id: string | number) => Admin.Records.destroy(id)}
        />
    );
}

