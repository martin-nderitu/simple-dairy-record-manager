import React, {useState, useMemo} from "react";
import {useHistory} from "react-router-dom";
import {useForm} from "../form/form";
import {Checkbox, Input, Select} from "../form/inputs";
import {isEmpty} from "../utils";
import FormCard from "../card/formCard";
import {Admin} from "../api";
import ButtonSpinner from "../spinners/buttonSpinner";
import {createUserSchema as schema} from "./schema";
import log from "../../log";


export default function CreateUser () {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const history = useHistory();

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => ({
            email: "", firstName: "", lastName: "", role: "", active: "", password: "", password2: ""
        }),[]),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to create user = ", values, "\n\n");
                    const response = await Admin.Users.create(values);
                    log("\n\nuser creation response = ", response, "\n\n");

                    if (response?.ok) {
                        const message = { type: "success", message: response.data.message };
                        setSubmitting(false);
                        history.push({ pathname: "/admin/users", state: {message} });
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
                    log("\n\nerror creating user ", error, "\n\n");
                }
            }
        },
        schema,
    });

    return (
        <FormCard
            message={message}
            setMessage={setMessage}
            title="Create User"
            body={
                <form className="p-2 rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        required={true}
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <Input
                        label="First name"
                        name="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        required={true}
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <Input
                        label="Last name"
                        name="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        required={true}
                        // @ts-ignore
                        attrs={attrs}
                    />


                    <Select
                        label="Role"
                        name="role"
                        required={true}
                        placeholder="Select role"
                        options={[ {value: "", label: "Select role..."}, "admin", "farmer", "milk collector"] }
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <Checkbox label="Active" name="active"
                              // @ts-ignore
                              attrs={attrs}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter a strong password"
                        required={true}
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <Input
                        label="Confirm Password"
                        name="password2"
                        type="password"
                        placeholder="Confirm password"
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
