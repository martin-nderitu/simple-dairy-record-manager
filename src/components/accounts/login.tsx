import React, {useState, useMemo, useCallback, useEffect} from "react";
import {useHistory, useLocation} from "react-router-dom";
import * as Yup from "yup";
import {useSetUser} from "../users/userContext";
import {useForm} from "../form/form";
import {Input} from "../form/inputs";
import {isEmpty} from "../utils";
import {Accounts} from "../api";
import FormCard from "../card/formCard";
import ButtonSpinner from "../spinners/buttonSpinner";
import {Message} from "../types";
import log from "../../log";


export default function Login() {
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const setUser = useSetUser();
    const schema = Yup.object({
        email: Yup.string()
            .typeError("Email is required")
            .required("Email is required")
            .email("Please provide a valid email address"),

        password: Yup.string()
            .typeError("Password is required")
            .required("Password is required"),
    });
    const history = useHistory();
    const location: any = useLocation();

    const getLocationStateMessage = useCallback(() => {
        if (location?.state?.message) { setMessage(location.state.message) }
    }, [location]);

    useEffect(() => { getLocationStateMessage(); }, [getLocationStateMessage]);

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => ({email: "", password: "" }), []),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                log("\n\nvalues to submit = ", values, "\n\n");
                try {
                    setSubmitting(true);
                    const response = await Accounts.login(values);
                    log("\n\nlogin response = ", response, "\n\n");

                    if (response?.ok) {
                        setSubmitting(false);
                        // @ts-ignore
                        setUser(response.data.user);
                        const {role} = response.data.user;
                        let pathname = "/";
                        if (role === "admin") { pathname = "/admin/users" }
                        if (role === "farmer") { pathname = "/farmers/records" }
                        if (role === "milk collector") { pathname = "/milk-collectors/records" }
                        const message = { type: "success", message: "Login success" }
                        history.push({ pathname, state: {message} });
                    } else {
                        if (response?.data.invalidData) {
                            setFormErrors(response.data.invalidData);
                        }
                        if (response?.data.error) {
                            const error = { type: "danger", message: response?.data.error };
                            setMessage(error);
                        }
                        setSubmitting(false);
                    }
                } catch (error) {
                    log("\n\nerror logging in ", error, "\n\n");
                }
            }
        },
        schema,
    });

    return (
        <FormCard
            title="User Login"
            message={message}
            setMessage={setMessage}
            body={
                <form className="rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required={true}
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required={true}
                        inline={false}
                        // @ts-ignore
                        attrs={attrs}
                    />

                    <button
                        className="w-100 btn btn-lg btn-primary rounded-0 mt-3"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? <ButtonSpinner text="Logging in"/> : "Login"}
                    </button>
                </form>
            }
        />
    );
}