import React, {useState, useEffect, useMemo} from "react";
import {isEmpty} from "../utils";
import {Input, Select} from "../form/inputs";
import {useForm} from "../form/form";
import {useHistory, useParams} from "react-router-dom";
import FormCard from "../card/formCard";
import schema from "./schema";
import Spinner from "../spinners/spinner";
import ButtonSpinner from "../spinners/buttonSpinner";
import Modal from "../modal";
import log from "../../log";


interface UpdateRecordProps {
    fetchCallback: (id: string | number) => Promise<{data: any, ok: any, status: any} | undefined>;
    updateCallback: (values: any) => Promise<{data: any, ok: any, status: any} | undefined>;
    destroyCallback: (query: string | number) => Promise<{data: any, ok: any, status: any} | undefined>;
    recordsPath: string;
}

export default function UpdateRecord ({fetchCallback, updateCallback, destroyCallback, recordsPath}: UpdateRecordProps) {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [record, setRecord] = useState<any>({});
    const history = useHistory();
    // @ts-ignore
    const {id} = useParams();

    useEffect( () => {
        (async () => {
            try { await fetchRecord(); }
            catch (error) {
                log("\n\nerror fetching record = ", error, "\n\n");
            }
        })();
    }, []);

    useEffect(() => {
        if (message) { scrollTop(); }
    }, [JSON.stringify(message)]);

    const scrollTop = () => { window.scrollTo(0, 0); }

    const fetchRecord = async () => {
        try {
            const response = await fetchCallback(id);
            log("\n\nfetch record response = ", response, "\n\n");

            if (response?.ok) {
                setRecord(response?.data.record);
            } else {
                const message = { type: "danger", message: response?.data.error }
                history.push({ pathname: recordsPath, state: message });
            }
        } catch (error) {
            log("\n\nerror fetching record ", error, "\n\n");
        }
    }

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => record, [record]),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to update record = ", values, "\n\n");
                    const response = await updateCallback(values);
                    if (response?.ok) {
                        setMessage({type: "success", message: response.data.message});
                        setSubmitting(false);
                    }
                    else {
                        if (response?.data.invalidData) {
                            setFormErrors(response.data.invalidData);
                        }
                        if (response?.data.error) {
                            setMessage({type: "danger", message: response.data.error});
                        }
                        setSubmitting(false);
                    }
                } catch (error) {
                    log("\n\nerror updating record ", error, "\n\n");
                }
            }
        },
        schema,
    });

    const handleDestroy = async () => {
        try {
            const response = await destroyCallback(record.id);
            if (response?.ok) {
                const message = { type: "success", message: response.data.message }
                history.push({ pathname: recordsPath, state: {message} });
            } else {
                setMessage({type: "danger", message: response?.data.error});
            }
        } catch (error) {
            log("\n\nerror deleting record ", error, "\n\n");
        }
    }

    return (
        <>
            <FormCard
                message={message}
                setMessage={setMessage}
                title="View/Update/Delete Record"
                body={
                    <>
                        {isEmpty(record) ? <Spinner/> :
                            <form className="p-2 rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
                                <Input
                                    label="Farmer id"
                                    name="farmerId"
                                    type="number"
                                    placeholder="Enter farmer id"
                                    required={true}
                                    // @ts-ignore
                                    attrs={attrs}
                                />

                                <Input
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    placeholder="Enter milk amount"
                                    required={true}
                                    // @ts-ignore
                                    attrs={attrs}
                                />

                                <Select
                                    label="Shift"
                                    name="shift"
                                    required={true}
                                    placeholder="Select shift"
                                    options={["", "morning", "afternoon", "evening"]}
                                    // @ts-ignore
                                    attrs={attrs}
                                />

                                <input type="hidden" name="id" value={attrs.values.id}/>

                                <button
                                    type="submit"
                                    className="btn btn-lg btn-primary rounded-0 me-2 mt-3"
                                    disabled={submitting}
                                >
                                    {submitting ? <ButtonSpinner text="Updating"/> : "Update"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-lg btn-danger rounded-0 mt-3"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete"
                                >
                                    Delete
                                </button>
                            </form>
                        }
                    </>
                }
            />
            <Modal
                id="delete"
                label="deleteLabel"
                title="Delete Milk Record"
                body="Are you sure you want to delete this milk record? This action cannot be undone."
                handleAction={handleDestroy}
            />
        </>
    );
}
