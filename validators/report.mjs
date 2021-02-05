import { query } from "express-validator";

const reportRules = {};

reportRules.queries = [
    query("farmerId")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Farmer id must be an integer greater than 1")
        .toInt(),

    query("shift")
        .optional({ checkFalsy: true })
        .trim().toLowerCase().isAlpha().withMessage("Shift must be alphabetic")
        .escape()
        .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift"),

    query("from")
        .optional({ checkFalsy: true })
        .trim().escape(),

    query("to")
        .optional({ checkFalsy: true })
        .trim().escape()
];

export { reportRules }

