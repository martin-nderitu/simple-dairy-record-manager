import * as Yup from "yup";

const schema = Yup.object({
    startDate: Yup.date()
        .typeError("Start date from is required")
        .required("Start date is required"),

    endDate: Yup.date()
        .typeError("End date is required")
        .required("End date is required")
        .min(Yup.ref("startDate"), "Start date cannot be before end date"),

    rate: Yup.number()
        .typeError("Rate is required")
        .required("Rate is required")
        .positive("Rate must be greater than 0")
        .test(
            "maxTwoDecimalPoints",
            "Rate must not exceed 2 decimal points",
            (number) => {
                if (number !== undefined) {
                    return /^\d+(\.\d{1,2})?$/.test(number.toString())
                }
                return true;
            }
        ),
});

export default schema;