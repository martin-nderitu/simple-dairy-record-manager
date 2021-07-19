import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import {useFieldAttrs} from "./form";

interface InputWrapperProps {
    inline: boolean | undefined,
    name: string;
    label: string;
    children: React.ReactNode;
}

interface Meta {
    touched?: boolean;
    error?: string;
}

interface InputProps {
    label: string;
    name: string;
    attrs: {
        values: {[k: string]: string};
        eventHandlers: {
            onChange: any;
            onFocus: any;
            onBlur: any;
        };
        meta: Meta;
    };
    inline?: boolean;
    validation?: boolean;
    className?: string;
    children?: React.ReactNode;
}

interface DateTimePickerProps extends InputProps {
    setValuesAndTouched: any;
    placeholder?: string;
    options?: {[k: string]: any};
}

interface CheckboxProps {
    label: string;
    name: string;
    attrs?: {
        values: {[k: string]: string};
        eventHandlers: {
            onChange: any;
            onFocus: any;
            onBlur: any;
        };
        meta: Meta;
    };
    inline?: boolean;
}

interface DataListProps extends InputProps {
    options: string [];
}

interface SelectProps extends InputProps {
    options?: ({ value: (string | number); label: string } | string) [];
}

const InputWrapper = ({inline, name, label, children}: InputWrapperProps) => {
    let classes = inline ? { div: "col-auto", label: "visually-hidden" } : { div: "mb-3", label: "form-label" };

    return (
        <div className={classes.div}>
            <label className={classes.label} htmlFor={name}>{label}</label>
            {children}
        </div>
    );
}

const InputClassNames = (meta: Meta, value="", classes="", validation = true) => {
    const { touched, error } = meta;
    let classNames = ["form-control rounded-0"];
    if (validation) {
        if (touched && error) { classNames.push("is-invalid"); }
        if (value && touched && !error) { classNames.push("is-valid"); }
    }
    return classNames.join(" ") + " " + classes;
}

const ErrorMessage = ({meta}: {meta: Meta}) => {
    const {touched, error} = meta;
    return (
        <>
            {touched && error ?
                <div className="form-text text-danger text-md-start" key={error}>
                    <span>{error}</span>
                </div>
                : null
            }
        </>
    );
}

const Input = (props: InputProps) => {
    let {label, name, inline, validation, className, attrs, ...rest} = props;
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    return (
        <InputWrapper inline={inline} name={name} label={label}>
            <input
                name={name}
                value={value}
                className={ InputClassNames(meta, value, className, validation) }
                {...rest}
                {...eventHandlers}
            />
            <ErrorMessage meta={meta} />
        </InputWrapper>
    );
}

const DataList = (props: DataListProps) => {
    let {label, name, inline, validation, className, attrs, options, ...rest} = props;
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    const dataList = (
        <datalist id={`${name}-list`}>
            {options?.length &&
                options.map(option => {
                    return ( <option key={option}> {option.toString()} </option> );
                })
            }
        </datalist>
    );

    return (
        <InputWrapper inline={inline} name={name} label={label}>
            <input
                name={name}
                value={value}
                className={ InputClassNames(meta, value, className, validation) }
                {...rest}
                {...eventHandlers}
                list={`${name}-list`}
            />
            {dataList}
            <ErrorMessage meta={meta} />
        </InputWrapper>
    );
}

const Select = (props: SelectProps) => {
    let {label, name, inline, validation, className, attrs, children, options, ...rest} = props;
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    const selectOptions = (() => {
        if (options?.length) {
            return (
                options.map((option: {value: (string | number), label: string} | string) => {
                    if (typeof option === "string") {
                        return <option key={option} value={option}>{option}</option>
                    }
                    return (
                        <option key={`${option.value}`} value={option.value}>
                            {option.label}
                        </option>
                    )
                })
            )
        }
    })();

    return (
        <InputWrapper inline={inline} name={name} label={label}>
            <select
                name={name}
                value={value}
                className={ InputClassNames(meta, value, className, validation) }
                {...rest}
                {...eventHandlers}
            >
                <>
                    {children}
                    {selectOptions}
                </>
            </select>
            <ErrorMessage meta={meta} />
        </InputWrapper>
    );
}

const TextArea = (props: InputProps) => {
    let {label, name, inline, validation, className, attrs, ...rest} = props;
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    return (
        <InputWrapper inline={inline} name={name} label={label}>
            <textarea
                name={name}
                value={value}
                rows={5}
                className={ InputClassNames(meta, value, className, validation) }
                {...rest}
                {...eventHandlers}
            >
                {value}
            </textarea>
            <ErrorMessage meta={meta} />
        </InputWrapper>
    );
}

const Checkbox = ({label, name, inline, attrs}: CheckboxProps) => {
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    const checkBox =  (
        <div className="mt-3 mb-3 form-check">
            <input className="form-check-input" type="checkbox"
                   name={name} id={name} value={value} checked={value} {...eventHandlers} />
            <label className="form-check-label" htmlFor={name}>{label}</label>
            <ErrorMessage meta={meta} />
        </div>
    );

    if (inline) { return ( <div className="col-auto">{checkBox}</div> ) }
    return (checkBox);
}

const DateTimeInput = (props: DateTimePickerProps) => {
    let {label, name, inline, validation, options, className, setValuesAndTouched, attrs, ...rest} = props;
    const {value, eventHandlers, meta} = useFieldAttrs(attrs, name);

    // @ts-ignore
    return (
        <InputWrapper inline={inline} name={name} label={label}>
            <Flatpickr
                key={value ? value.toString() : "flatpickr"}
                className={InputClassNames(meta, value, className)}
                placeholder={rest.placeholder}
                options={{
                    altInput: true,
                    altInputClass: InputClassNames(meta, value, className),
                    altFormat: "D M d Y",
                    enableTime: true,
                    defaultDate: value,
                    disableMobile: true,
                    ...options,
                }}
                onChange={ date => setValuesAndTouched(name, new Date(date[0])) }
            />
            <input
                type="hidden"
                name={name}
                value={value}
                {...eventHandlers}
            />
            <ErrorMessage meta={meta} />
        </InputWrapper>
    );
}


export {
    Input, DataList, Select, TextArea, Checkbox, DateTimeInput
}
