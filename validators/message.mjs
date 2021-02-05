import {body, check, oneOf, query} from "express-validator";
import { Message } from "../models/message.mjs";
import {toTitleCase} from "../utils/stringFormat.mjs";

const messageRules = {};

messageRules.queries = [

    oneOf([
        check("search")
            .optional({ checkFalsy: true })
            .trim().toLowerCase().isEmail().normalizeEmail().escape(),

        check("search")
            .optional({ checkFalsy: true })
            .trim().matches(/^[A-Za-z\s]+$/)
            .escape(),
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

messageRules.create = [
    body("email")
        .trim().notEmpty().withMessage("Email is required")
        .isLength({min: 2, max: 30}).withMessage("Email must be between 5 and 30 characters")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail().escape(),

    body("name")
        .trim().notEmpty().withMessage("Name is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Firstname must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Name must be between 5 and 30 characters")
        .escape()
        .customSanitizer(name => {
            return toTitleCase(name);
        }),

    body("subject")
        .trim().notEmpty().withMessage("Subject is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Subject must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Subject must be between 5 and 30 characters")
        .escape(),

    body("message")
        .trim().notEmpty().withMessage("Message is required")
        .isLength({min: 5, max: 255}).withMessage("Message must be between 5 and 255 characters")
        .escape(),
];

messageRules.actions = [

    oneOf([
        check("messageIds")
            .notEmpty().withMessage("An id array is required to perform action")
            .isArray({min: 1}).withMessage("Message ids must be a non-empty array of integers")
            .custom( messageIds => {
                messageIds.forEach( (id, index, messageIds) => {
                    if (!Number.isInteger(parseInt(id))) {
                        throw new Error(`Non-integer value ${id} found in id array`);
                    } else if (id <= 0) {
                        throw new Error("All ids must be greater than 0");
                    }
                    messageIds[index] = parseInt(messageIds[index]);
                });
                return true;
            })
            .customSanitizer(async messageIds => {
                // remove ids that don't exist in db
                let temp = [];
                for (const id of messageIds) {
                    const message = await Message.findByPk(id);
                    if (message !== null) {
                        temp.push(id);
                    }
                }
                return temp;
            }),

        check("messageIds")
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

export { messageRules }

