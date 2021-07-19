import React, {useState, useEffect, useMemo} from "react";
import {isEmpty} from "../utils";
import {Checkbox, Input, Select} from "../form/inputs";
import {useForm} from "../form/form";
import {useHistory, useParams} from "react-router-dom";
import FormCard from "../card/formCard";
import {Admin} from "../api";
import Spinner from "../spinners/spinner";
import ButtonSpinner from "../spinners/buttonSpinner";
import Modal from "../modal";
import {updateUserSchema as schema} from "./schema";
import log from "../../log";


export default function UpdateUser () {
    const [message, setMessage] = useState<{type: string, message: string} | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>({});
    const history = useHistory();
    // @ts-ignore
    const {id} = useParams();

    useEffect( () => {
        (async () => {
            try { await fetchUser(); }
            catch (error) {
                log("\n\nerror fetching user = ", error, "\n\n");
            }
        })();
    }, []);

    useEffect(() => {
        if (message) { scrollTop(); }
    }, [JSON.stringify(message)]);

    const fetchUser = async () => {
        try {
            const response = await Admin.Users.find(id);
            log("\n\nfetch user response = ", response, "\n\n");

            if (response?.ok) {
                setUser(response?.data.user);
            } else {
                const message = { type: "danger", message: response?.data.error }
                history.push({ pathname: "/users", state: message });
            }
        } catch (error) {
            log("\n\nerror fetching user ", error, "\n\n");
        }
    }

    const scrollTop = () => { window.scrollTo(0, 0); }

    const {
        handleSubmit, setFormErrors, ...attrs
    } = useForm({
        initialValues: useMemo(() => user, [user]),
        onSubmit: async ({values, formErrors}) => {
            if (isEmpty(formErrors)) {
                try {
                    setSubmitting(true);
                    log("\n\nvalues to update user = ", values, "\n\n");
                    const response = await Admin.Users.update(values);
                    log("\n\nupdate user response = ", response, "\n\n");
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
                    log("\n\nerror updating user ", error, "\n\n");
                }
            }
        },
        schema,
    });

    const handleDestroy = async () => {
        try {
            const response = await Admin.Users.destroy(user.id);
            if (response?.ok) {
                const message = { type: "success", message: response.data.message };
                history.push({ pathname: "/users", state: {message} });
            } else {
                setMessage({type: "danger", message: response?.data.error});
            }
        } catch (error) {
            log("\n\nerror deleting user ", error, "\n\n");
        }
    }

    return (
        <>
            <FormCard
                message={message}
                setMessage={setMessage}
                title="View/Update/Delete User"
                body={
                    <>
                        {isEmpty(user) ? <Spinner/> :
                            <form className="p-2 rounded-0 bg-transparent border-0" onSubmit={handleSubmit}>
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
                title="Delete User"
                body="Are you sure you want to delete this user? This action cannot be undone."
                handleAction={handleDestroy}
            />
        </>
    );
}

