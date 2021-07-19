import * as Yup from "yup";

const schema = {
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

    role: Yup.mixed()
        .oneOf(["admin", "farmer", "milk collector"], "Invalid role"),
}

const createUserSchema = Yup.object({
    email: Yup.string()
        .typeError("Email is required")
        .required("Email is required")
        .email("Please enter a valid email address"),

    ...schema,

    password: Yup.string()
        .typeError("Password is required")
        .required("Password is required"),

    password2: Yup.string()
        .oneOf([Yup.ref("password"),null], "Password confirmation does not match password"),
});

const updateUserSchema = Yup.object({...schema});

export {createUserSchema, updateUserSchema};