import {useEffect, useState, useCallback, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {Admin} from "../api";
import DataTable from "../table/dataTable";
import {useForm} from "../form/form";
import {Input, Select, Checkbox} from "../form/inputs";
import {Pagination, Message, ViewManyProps, SearchFormProps} from "../types";
import log from "../../log";


function SearchForm({handleSearchForm}: SearchFormProps) {
    const { handleSubmit, setValues, ...attrs } = useForm({
        initialValues: useMemo(() => ({ idNameOrEmail: "", role: "", active: ""}),[]),
        onSubmit: ({values}) => {
            handleSearchForm(values);
        },
    });

    return (
        <div className="container-fluid pt-3">
            <form className="row gy-2 gx-3 align-items-center" onSubmit={handleSubmit}>
                <Input
                    label="User id, name or email"
                    name="idNameOrEmail"
                    type="text"
                    placeholder="user id, name or email"
                    inline={true}
                    // @ts-ignore
                    attrs={attrs}
                />

                <Select
                    label="Role"
                    name="role"
                    inline={true}
                    options={[ {value: "", label: "Select role..."}, "admin", "farmer", "milk collector"] }
                    // @ts-ignore
                    attrs={attrs}
                />

                <Checkbox label="Active" name="active" inline={true}
                          // @ts-ignore
                          attrs={attrs}
                />

                <div className="col-auto">
                    <button type="submit" className="btn btn-primary rounded-0">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default function UsersView({createLink, selection, cols, fetchCallback}: ViewManyProps) {
    const [users, setUsers] = useState<any[] | null>(null);
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
        log("\n\nusers query = ", query,"\n\n");
        (async () => { await fetchUsers(); })();
    }, [query]);

    useEffect(() => {
        if (destroyed) {
            (async () => { await fetchUsers(); })();
            setDestroyed(false);
        }
    },[destroyed]);

    useEffect(() => { if (message) { window.scrollTo(0, 0) } }, [message]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetchCallback(query);
            log("\n\nfetch users response = ", response, "\n\n");
            if (response?.ok) {
                const {users, pagination} = response?.data;
                setUsers(users);
                setPagination(pagination);
                setIsLoading(false);
            } else {
                const error = { type: "danger", message: response?.data.error };
                // @ts-ignore
                setUsers(null);
                setPagination(null);
                setIsLoading(false);
                log("\n\nerror fetching users = ", error, "\n\n");
            }
        } catch (error) {
            log("\n\nerror fetching users = ", error, "\n\n");
        }
    }

    return (
        <DataTable
            data={users}
            pagination={pagination}
            cols={cols}
            message={message}
            setMessage={setMessage}
            setQuery={setQuery}
            setDestroyed={setDestroyed}
            isLoading={isLoading}
            title="Users"
            selection={selection}
            createLink={createLink}
            searchForm={useCallback(() => SearchForm, [])}
            destroyCallback={(id: string | number) => Admin.Users.destroy(id)}
        />
    );
}

