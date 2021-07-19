import React, {useState, useEffect, useMemo} from "react";
import {isEmpty} from "../utils";
import {DateTimeInput, Input, Select} from "../form/inputs";
import {useForm} from "../form/form";
import {useHistory, useParams} from "react-router-dom";
import FormCard from "../card/formCard";
import {Admin} from "../api";
import schema from "./schema";
import Spinner from "../spinners/spinner";
import ButtonSpinner from "../spinners/buttonSpinner";
import Modal from "../modal";
import log from "../../log";


export default function UpdateRecord () {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [rate, setRate] = useState<any>({});
    const history = useHistory();
    // @ts-ignore
    const {id} = useParams();

    useEffect( () => {
        (async () => {
            try { await fetchRate(); }
            catch (error) {
                log("\n\nerror fetching rate = ", error, "\n\n");
            }
        })();
    }, []);

    useEffect(() => {
        if (message) { scrollTop(); }
    }, [JSON.stringify(message)]);

    const fetchRate = async () => {
        try {
            const response = await Admin.Rates.find(id);
            log("\n\nfetch rate response = ", response, "\n\n");

            if (response?.ok) {
                setRate(response?.data.rate);
            } else {
                const message = { type: "danger", message: response?.data.error }
                history.push({ pathname: "/rates", state: message });
            }
        } catch (error) {
            log("\n\nerror fetching rate ", error, "\n\n");
        }
    }

    const scrollTop = () => { window.scrollTo(0, 0); }

    const initialValues = useMemo(() => {
        if (isEmpty(rate)) { return { id: "", startDate: "", endDate: "", rate: "" } }
        return rate;
    }, [rate]);

    const {
        handleSubmit, setValuesAndTouched, setFormErrors, ...attrs
    } = useForm({
        initialValues,
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to update rate = ", values, "\n\n");
                    const response = await Admin.Rates.update(values);
                    log("\n\nupdate rate response = ", response, "\n\n");

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
                    log("\n\nerror updating rate ", error, "\n\n");
                }
            }
        },
        schema,
    });

    const handleDestroy = async () => {
        try {
            const response = await Admin.Rates.destroy(rate.id);
            if (response?.ok) {
                const message = { type: "success", message: response.data.message }
                history.push({ pathname: "/admin/rates", state: {message} });
            } else {
                setMessage({type: "danger", message: response?.data.error});
            }
        } catch (error) {
            log("\n\nerror deleting rate ", error, "\n\n");
        }
    }

    return (
        <>
            <FormCard
                message={message}
                setMessage={setMessage}
                title="View/Update/Delete Rate"
                body={
                    <>
                        {isEmpty(rate) ? <Spinner/> :
                            <form className="p-2 pb-0 rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
                                <DateTimeInput
                                    label="Start date"
                                    name="startDate"
                                    placeholder="Start date..."
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
                                    // @ts-ignore
                                    attrs={attrs}
                                    setValuesAndTouched={setValuesAndTouched}
                                    options={{
                                        enableTime: false,
                                    }}
                                />

                                <Input
                                    label="Rate"
                                    name="rate"
                                    type="number"
                                    placeholder="Enter rate"
                                    required={true}
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
                title="Delete Rate"
                body="Are you sure you want to delete this rate? This action cannot be undone."
                handleAction={handleDestroy}
            />
        </>
    );
}

