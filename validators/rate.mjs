import { check, oneOf, query, body } from "express-validator";
import {Rate} from "../models/user.mjs";
import { rateOverlapsOther, rateOverlapsOnlyItself } from "../utils/models.mjs";

const rateRules = {};

rateRules.queries = [

    query("from")
        .optional({ checkFalsy: true })
        .trim().escape(),

    query("to")
        .optional({ checkFalsy: true })
        .trim().escape(),

    query("rate")
        .optional({ checkFalsy: true })
        .isFloat({min: 1.00}).withMessage("Rate should be a valid number greater than 1.00")
        .toFloat(),

    query("setterId")
        .optional({ checkFalsy: true })
        .isInt({min: 1}).withMessage("setter id must be a number greater than 0")
        .toInt(),

    query("sortBy")
        .optional({ checkFalsy: true })
        .trim().isAlpha().withMessage("sortBy must be alphabetic")
        .escape(),

    query("order")
        .optional({ checkFalsy: true })
        .trim().isAlpha().toLowerCase().withMessage("Order must be alphabetic")
        .isIn(["desc", "asc"]).withMessage("Invalid order")
        .escape(),
];

rateRules.create = [

    body("to")
        .trim().notEmpty().withMessage("Please specify end date")
        .escape()
        .isDate().withMessage("To must be a valid date")
        .toDate()
        .custom( (to, {req}) => {
            if (to < req.body.from) {
                throw new Error("Date to cannot be before date from");
            }
            return true;
        }),

    body("from")
        .trim().notEmpty().withMessage("Please specify start date")
        .escape()
        .isDate().withMessage("From must be a valid date")
        .toDate()
        .custom( async (from, {req}) => {
            if (await rateOverlapsOther(from, req.body.to)) {
                throw new Error("Date overlap error. A rate exists covering the entered date")
            }
            return true;
        }),

    body("rate")
        .trim().notEmpty().withMessage("Rate is required")
        .isFloat({min: 1.00}).withMessage("Rate should be a valid number greater than 1.00")
        .toFloat()
];

rateRules.edit = [
    body("id")
        .trim().notEmpty().withMessage("Rate id is required")
        .isInt({min: 1}).withMessage("Rate id should be a valid number greater than 0")
        .toInt(),

    body("to")
        .trim().notEmpty().withMessage("Please specify end date")
        .escape()
        .isDate().withMessage("To must be a valid date")
        .toDate()
        .custom( (to, {req}) => {
            if (to < req.body.from) {
                throw new Error("Date to cannot be before date from");
            }
            return true;
        }),

    body("from")
        .trim().notEmpty().withMessage("Please specify start date")
        .escape()
        .isDate().withMessage("From must be a valid date")
        .toDate()
        .custom( async (from, {req}) => {
            if (!await rateOverlapsOnlyItself(from, req.body.to, req.body.id)) {
                throw new Error("Date overlap error. A rate exists covering the entered date")
            }
            return true;
        }),

    body("rate")
        .trim().notEmpty().withMessage("Rate is required")
        .isFloat({min: 1.00}).withMessage("Rate should be a valid number greater than 1.00")
        .toFloat()
];

rateRules.actions = [

    oneOf([
        check("rateIds")
            .notEmpty().withMessage("An id array is required to perform action")
            .isArray({min: 1}).withMessage("Rate ids must be a non-empty array of integers")
            .custom( rateIds => {
                rateIds.forEach( (id, index, rateIds) => {
                    if (!Number.isInteger(parseInt(id))) {
                        throw new Error(`Non-integer value ${id} found in id array`);
                    } else if (id <= 0) {
                        throw new Error("All ids must be greater than 0");
                    }
                    rateIds[index] = parseInt(rateIds[index]);
                });
                return true;
            })
            .customSanitizer(async rateIds => {
                // remove ids that don't exist in db
                let temp = [];
                for (const id of rateIds) {
                    const rate = await Rate.findByPk(id);
                    if (rate !== null) {
                        temp.push(id);
                    }
                }
                return temp;
            }),

        check("rateIds")
            .notEmpty().withMessage("An id is required to perform action")
            .isInt().withMessage("A valid id must be an integer")
            .toInt()
            .custom( rateId => {
                if (rateId <= 0) {
                    throw new Error("A valid id must be greater than 0");
                }
                return true;
            }),
    ]),

    query("action")
        .notEmpty().withMessage("Action is required")
        .trim().isAlpha().withMessage("Action must be alphabetic")
        .escape()
        .isIn(["deleteSelected"]).withMessage("Invalid action")
];

export { rateRules }
