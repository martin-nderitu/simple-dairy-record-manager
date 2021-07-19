import React, {useState, useMemo} from "react";
import {useHistory} from "react-router-dom";
import {useForm} from "../form/form";
import {Input, Select} from "../form/inputs";
import {isEmpty} from "../utils";
import FormCard from "../card/formCard";
import {Admin, MilkCollector} from "../api";
import ButtonSpinner from "../spinners/buttonSpinner";
import schema from "./schema";
import {useUser} from "../users/userContext";
import log from "../../log";


export default function CreateRecord ({successRedirect}: {successRedirect: string}) {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const history = useHistory();
    const user = useUser();

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => ({ farmerId: "", amount: "", shift: "" }),[]),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to create record = ", values, "\n\n");
                    let response = undefined;
                    if (user?.role === "admin") {
                        response = await Admin.Records.create(values);
                    }
                    if (user?.role === "milk collector") {
                        response = await MilkCollector.Records.create(values);
                    }
                    log("\n\ncreate record response = ", response, "\n\n");

                    if (response?.ok) {
                        const message = { type: "success", message: response?.data.message };
                        setSubmitting(false);
                        let pathname = "/";
                        if (user?.role === "admin") { pathname = "/admin/records" }
                        if (user?.role === "milk collector") { pathname = "/milk-collectors/records" }
                        history.push({ pathname, state: {message} });
                    }
                    else {
                        if (response?.data.invalidData) {
                            setFormErrors(response?.data.invalidData);
                        }
                        if (response?.data.error) {
                            setMessage({ type: "danger", message: response?.data.error });
                        }
                        setSubmitting(false);
                    }
                } catch (error) {
                    log("\n\nerror creating record ", error, "\n\n");
                }
            }
        },
        schema,
    });

    return (
        <FormCard
            message={message}
            setMessage={setMessage}
            title="Create Record"
            body={
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
                        options={[ {value: "", label: "Select shift..."}, "morning", "afternoon", "evening"] }
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
