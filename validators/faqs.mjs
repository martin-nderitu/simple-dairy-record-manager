import {body, check, oneOf, query} from "express-validator";
import {Faq} from "../models/user.mjs";

const faqRules = {};

faqRules.queries = [
    oneOf([
        check("search")
            .optional({ checkFalsy: true })
            .trim().isInt().toInt(),

        check("search")
            .optional({ checkFalsy: true })
            .trim().matches(/^[A-Za-z\s]+$/)
            .toLowerCase()
            .escape()
    ]),

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
        .trim().escape(),

    query("to")
        .optional({ checkFalsy: true })
        .trim().escape()
];

faqRules.add = [
    body("question")
        .trim().notEmpty().withMessage("A question is required")
        .isLength({min: 5, max: 255}).withMessage("A question must be between 5 and 255 characters")
        .escape(),

    body("answer")
        .trim().notEmpty().withMessage("An answer is required")
        .escape(),
];

faqRules.edit = [

    body("id")
        .notEmpty().withMessage("Faq id is required")
        .isInt().withMessage("Faq id should be an integer")
        .toInt()
        .custom( async id => {
            let faq = await Faq.findByPk(id);
            if (faq === null) {
                return Promise.reject("Faq doesn't exist");
            }
            return true;
        }),

    body("question")
        .trim().notEmpty().withMessage("A question is required")
        .isLength({min: 5, max: 255}).withMessage("A question must be between 5 and 255 characters")
        .escape(),

    body("answer")
        .trim().notEmpty().withMessage("An answer is required")
        .escape(),
];

faqRules.actions = [

    oneOf([
        check("faqIds")
            .notEmpty().withMessage("An id array is required to perform action")
            .isArray({min: 1}).withMessage("Faq ids must be a non-empty array of integers")
            .custom( faqIds => {
                faqIds.forEach( (id, index, faqIds) => {
                    if (!Number.isInteger(parseInt(id))) {
                        throw new Error(`Non-integer value ${id} found in id array`);
                    } else if (id <= 0) {
                        throw new Error("All ids must be greater than 0");
                    }
                    faqIds[index] = parseInt(faqIds[index]);
                });
                return true;
            })
            .customSanitizer(async faqIds => {
                // remove ids that don't exist in db
                let temp = [];
                for (const id of faqIds) {
                    const faq = await Faq.findByPk(id);
                    if (faq !== null) {
                        temp.push(id);
                    }
                }
                return temp;
            }),

        check("faqIds")
            .notEmpty().withMessage("An id is required to perform action")
            .isInt().withMessage("A valid id must be an integer")
            .toInt()
            .custom( id => {
                if (id <= 0) {
                    throw new Error("A valid id must be greater than 0");
                }
                return true;
            }),
    ]),

    query("action")
        .notEmpty().withMessage("Action is required")
        .trim().isAlpha().withMessage("Action must be alphabetic")
        .escape()
        .isIn(["deleteSelected"]).withMessage("Invalid action"),
];

export { faqRules }
