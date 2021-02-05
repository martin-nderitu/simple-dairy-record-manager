import { query } from "express-validator";

const farmerRules = {};

farmerRules.queries = [

    query("shift")
        .optional({ checkFalsy: true })
        .trim().toLowerCase().isAlpha().withMessage("Shift must be alphabetic")
        .escape()
        .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift"),

    query("sortBy")
        .optional({ checkFalsy: true })
        .trim().isAlpha().withMessage("sortBy must be alphabetic")
        .escape(),

    query("order")
        .optional({ checkFalsy: true })
        .trim().isAlpha().toLowerCase().withMessage("Order must be alphabetic")
        .isIn(["desc", "asc"]).withMessage("Invalid order")
        .escape(),

    query("from")
        .optional({ checkFalsy: true })
        .trim().escape()
        .isDate().withMessage("From must be a valid date")
        .toDate(),

    query("to")
        .optional({ checkFalsy: true })
        .trim().escape()
        .isDate().withMessage("To must be a valid date")
        .toDate()
];

export {farmerRules}
