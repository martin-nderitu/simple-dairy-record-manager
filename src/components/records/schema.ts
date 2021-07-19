import * as Yup from "yup";

const schema = Yup.object({
    farmerId: Yup.number()
        .typeError("Farmer id is required")
        .required("Farmer id is required")
        .positive("Farmer id must be greater than 0")
        .integer("Farmer id must be an integer"),

    amount: Yup.number()
        .typeError("Milk amount is required")
        .required("Milk amount is required")
        .positive("Milk amount must be greater than 0")
        .test(
            "maxTwoDecimalPoints",
            "Milk amount must not exceed 2 decimal points",
            (number) => {
                if (number !== undefined) {
                    return /^\d+(\.\d{1,2})?$/.test(number.toString())
                }
                return true;
            }
        ),

    shift: Yup.mixed()
        .oneOf(["morning", "afternoon", "evening"], "Invalid shift"),
});

export default schema;