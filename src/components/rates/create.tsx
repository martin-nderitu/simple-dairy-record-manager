import React, {useState, useMemo} from "react";
import {useHistory} from "react-router-dom";
import {useForm} from "../form/form";
import {DateTimeInput, Input} from "../form/inputs";
import {isEmpty} from "../utils";
import FormCard from "../card/formCard";
import {Admin} from "../api";
import ButtonSpinner from "../spinners/buttonSpinner";
import schema from "./schema";
import log from "../../log";


export default function CreateRate () {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const history = useHistory();

    const {
        handleSubmit, setValuesAndTouched, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => ({ startDate: "", endDate: "", rate: "" }),[]),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to create rate = ", values, "\n\n");
                    const response = await Admin.Rates.create(values);
                    log("\n\nrate creation response = ", response, "\n\n");

                    if (response?.ok) {
                        const message = { type: "success", message: response.data.message };
                        setSubmitting(false);
                        history.push({ pathname: "/admin/rates", state: {message} });
                    }
                    else {
                        if (response?.data.invalidData) {
                            setFormErrors(response.data.invalidData);
                        }
                        if (response?.data.error) {
                            setMessage({ type: "danger", message: response.data.error });
                        }
                        setSubmitting(false);
                    }
                } catch (error) {
                    log("\n\nerror creating rate ", error, "\n\n");
                }
            }
        },
        schema,
    });

    return (
        <FormCard
            message={message}
            setMessage={setMessage}
            title="Create Rate"
            body={
                <form className="p-2 rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
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

                    <button
                        className="w-100 btn btn-lg btn-primary rounded-0 mt-3"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? <ButtonSpinner text="Creating"/> : "Create"}
                    </button>
                </form>
            }
        />
    );
}
