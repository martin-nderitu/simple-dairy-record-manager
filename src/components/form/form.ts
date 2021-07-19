import {useState, useEffect, useRef, useCallback} from "react";
import {isEmpty} from "../utils";
import log from "../../log";


interface UseFormProps {
    initialValues: any;
    onSubmit: (args: {
        values: {[k: string]: string },
        formErrors: {[k: string]: string }
    }) => any;
    schema?: any;
}

const useForm = ({initialValues, onSubmit, schema = null}: UseFormProps) => {
    const firstRender = useRef(true);
    const [values, setValues] = useState(initialValues || {});
    const [touched, setTouched] = useState({});
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        log("\n\nform errors = ", formErrors, "\n\n");
    },[formErrors]);

    useEffect(() => {
        if (!isEmpty(initialValues)) {
            setValues(initialValues);
        }
    }, [initialValues, JSON.stringify(initialValues)]);

    const validate = useCallback(async () => {
        const errors: {[k: string]: string } = {};
        try {
            if (schema === null) { return; }
            else {
                const value = await schema.validate(values, { abortEarly: false });
            }
        } catch (error: any) {
            error.inner.forEach( (err: any) => {
                errors[err.path] = err.message;
            });
        }
        setFormErrors({ ...errors });
    }, [schema, values]);

    useEffect( () => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        log("\n\nform values = ", values, "\n\n");
        (async () => { await validate(); })();
    }, [values]);

    const handleChange = (event: any) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        setValues({...values, [name]: value});
        setTouched({
            ...touched, [name]: true
        });
    };

    const handleFocus = (event: any) => {};

    const handleBlur = (event: any) => {};

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        await validate();
        onSubmit({ values, formErrors });
    };

    const setValuesAndTouched = (name: string, value: any) => {
        setValues({...values, [name]: value});
        setTouched({...touched, [name]: true});
    }

    return {
        values,
        touched,
        formErrors,
        setValues,
        setTouched,
        setFormErrors,
        setValuesAndTouched,
        handleSubmit,
        eventHandlers: {
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
        },
    }
}

const useFieldAttrs = (attrs: any, field: string) => {
    const {values, eventHandlers, touched, formErrors} = attrs;
    return {
        eventHandlers,
        value: values[field],
        meta: {
            touched: touched[field],
            error: formErrors[field]
        }
    };
}

export {
    useForm, useFieldAttrs
}