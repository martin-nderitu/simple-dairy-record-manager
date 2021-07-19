import {useEffect, useState, useCallback, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {Admin} from "../api";
import DataTable from "../table/dataTable";
import {useForm} from "../form/form";
import {Input, DateTimeInput} from "../form/inputs";
import {useUser} from "../users/userContext";
import {Pagination, Message, ViewManyProps, SearchFormProps} from "../types";
import log from "../../log";


function SearchForm({handleSearchForm}: SearchFormProps) {
    const user = useUser();

    const { handleSubmit, setValuesAndTouched, ...attrs } = useForm({
        initialValues: useMemo(() => ({ setter: "", from: "", to: "" }),[]),
        onSubmit: ({values}) => {
            handleSearchForm(values);
        },
    });

    return (
        <div className="container-fluid pt-3">
            <form className="row gy-2 gx-3 align-items-center" onSubmit={handleSubmit}>
                {user?.role === "admin" ?
                    <Input
                        label="Setter"
                        name="setter"
                        type="text"
                        placeholder="setter name or email"
                        inline={true}
                        // @ts-ignore
                        attrs={attrs}
                    />
                    : null
                }

                <DateTimeInput
                    label="Start date"
                    name="startDate"
                    placeholder="Start date..."
                    inline={true}
                    // @ts-ignore
                    attrs={attrs}
                    setValuesAndTouched={setValuesAndTouched}
                    options={{
                        enableTime: false,
                    }}
                />

                <DateTimeInput
                    label="End date"
                    name="endDate"
                    placeholder="End date..."
                    inline={true}
                    // @ts-ignore
                    attrs={attrs}
                    setValuesAndTouched={setValuesAndTouched}
                    options={{
                        enableTime: false,
                    }}
                />

                <div className="col-auto">
                    <button type="submit" className="btn btn-primary rounded-0">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default function RatesView({createLink, selection, cols, fetchCallback}: ViewManyProps) {
    const [rates, setRates] = useState<any[] | null>(null);
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
        log("\n\nrates query = ", query,"\n\n");
        (async () => { await fetchRates(); })();
    }, [query]);

    useEffect(() => {
        if (destroyed) {
            (async () => { await fetchRates(); })();
            setDestroyed(false);
        }
    },[destroyed]);

    useEffect(() => { if (message) { window.scrollTo(0, 0) } }, [message]);

    const fetchRates = async () => {
        try {
            setIsLoading(true);
            const response = await fetchCallback(query);
            log("\n\nfetch rates response = ", response, "\n\n");
            if (response?.ok) {
                const {rates, pagination} = response?.data;
                setRates(rates);
                setPagination(pagination);
                setIsLoading(false);
            } else {
                const error = { type: "danger", message: response?.data.error };
                // @ts-ignore
                setRates(null);
                setPagination(null);
                setIsLoading(false);
                log("\n\nerror fetching rates = ", error, "\n\n");
            }
        } catch (error) {
            log("\n\nerror fetching rates = ", error, "\n\n");
        }
    }

    return (
        <DataTable
            data={rates}
            pagination={pagination}
            cols={cols}
            message={message}
            setMessage={setMessage}
            setQuery={setQuery}
            setDestroyed={setDestroyed}
            isLoading={isLoading}
            title="Rates"
            selection={selection}
            createLink={createLink}
            searchForm={useCallback(() => SearchForm, [])}
            destroyCallback={(id: string | number) => Admin.Rates.destroy(id)}
        />
    );
}


