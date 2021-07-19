import React, {useState, useMemo} from "react";
import * as Yup from "yup";
import {useHistory, useLocation} from "react-router-dom";
import {useSetUser} from "../users/userContext";
import {useForm} from "../form/form";
import {Input} from "../form/inputs";
import {isEmpty} from "../utils";
import {Accounts} from "../api";
import FormCard from "../card/formCard";
import ButtonSpinner from "../spinners/buttonSpinner";
import log from "../../log";


export default function Register() {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const setUser = useSetUser();
    const schema = Yup.object({
        email: Yup.string()
            .typeError("Email is required")
            .required("Email is required")
            .email("Please provide a valid email address"),

        firstName: Yup.string()
            .typeError("First name is required")
            .required("First name is required")
            .min(2, "First name must be at least 2 characters long")
            .max(30, "First name must not exceed 20 characters")
            .matches(/^[aA-zZ\s]+$/, "First name must be alphabetic"),

        lastName: Yup.string()
            .typeError("Last name is required")
            .required("Last name is required")
            .min(2, "Last name must be at least 2 characters long")
            .max(30, "Last name must not exceed 20 characters")
            .matches(/^[aA-zZ\s]+$/, "Last name must be alphabetic"),

        password: Yup.string()
            .typeError("Password is required")
            .required("Password is required"),

        password2: Yup.string()
            .oneOf([Yup.ref("password"),null], "Password confirmation does not match password"),
    });
    const history = useHistory();
    const location: any = useLocation();

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => ({
            email: "", firstName: "", lastName: "", password: "", password2: ""
        }), []),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                log("\n\nvalues to submit = ", values, "\n\n");
                try {
                    setSubmitting(true);
                    const response = await Accounts.register(values);
                    log("\n\nregistration response = ", response, "\n\n");

                    if (response?.ok) {
                        setSubmitting(false);
                        // @ts-ignore
                        setUser(response.data.user);
                        const message = { type: "success", message: "Registration success" };
                        history.push({ pathname: "/farmers/records", state: {message} });
                    } else {
                        if (response?.data.invalidData) {
                            setFormErrors(response.data.invalidData);
                        }
                        if (response?.data.error) {
                            setMessage({ type: "danger", message: response.data.error });
                        }
                        setSubmitting(false);
                    }
                } catch (error) {
                    log("\n\nerror registering ", error, "\n\n");
                }
            }
        },
        schema,
    });

    return (
        <FormCard
            message={message}
            setMessage={setMessage}
            title="Farmer Registration"
            body={
                <form className="rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
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
                        label="Confirm password"
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
                        {submitting ? <ButtonSpinner text="Registering"/> : "Register"}
                    </button>
                </form>
            }
        />
    );
}