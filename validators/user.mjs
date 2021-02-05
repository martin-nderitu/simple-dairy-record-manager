import { check, oneOf, query, body } from "express-validator";
import { toTitleCase } from "../utils/stringFormat.mjs";
import { User } from "../models/user.mjs";

const userRules = {};

userRules.login = [

    body("email")
        .trim().notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail().toLowerCase().escape()
        .custom( async email => {
            const user = await User.findOne({ where : { email } });
            if (user === null) {
                return Promise.reject("Incorrect email or password");
            }
            return true;
        }),

    body("password")
        .trim().notEmpty().withMessage("Password is required")
        .escape()
];

userRules.queries = [

    oneOf([
        check("search")
            .optional({ checkFalsy: true })
            .trim().isInt().toInt(),

        check("search")
            .optional({ checkFalsy: true })
            .trim().toLowerCase().isEmail().normalizeEmail().escape(),

        check("search")
            .optional({ checkFalsy: true })
            .trim().matches(/^[A-Za-z\s]+$/)
            .escape()
            .customSanitizer(search => {
                return toTitleCase(search);
            })
    ]),

    query("role")
        .optional({ checkFalsy: true })
        .trim().toLowerCase()
        .matches(/^[A-Za-z\s]+$/).withMessage("Role must be alphabetic")
        .escape()
        .isIn(["admin", "farmer", "milk collector"]).withMessage("Invalid role"),

    query("sortBy")
        .optional({ checkFalsy: true })
        .trim().isAlpha().withMessage("sortBy must be alphabetic")
        .escape(),

    query("order")
        .optional({ checkFalsy: true })
        .trim().isAlpha().toLowerCase().withMessage("Order must be alphabetic")
        .escape()
        .isIn(["desc", "asc"]).withMessage("Invalid order"),

    query("active")
        .optional({ checkFalsy: true })
        .isInt().withMessage("Active must be an integer")
        .toInt(),

    query("limit")
        .optional({ checkFalsy: true })
        .isInt({ min:5, max:500 }).withMessage("Limit must be an integer between 1 and 500")
        .toInt()
];

userRules.create = [

    body("email")
        .trim().notEmpty().withMessage("Email is required")
        .isLength({min: 2, max: 30}).withMessage("Email must be between 5 and 30 characters")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail().toLowerCase().escape()
        .custom( async email => {
            const user = await User.findOne({ where : { email } });
            if (user !== null) {
                return Promise.reject("This email address is already registered");
            }
            return true;
        }),

    body("firstname")
        .trim().notEmpty().withMessage("Firstname is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Firstname must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Firstname must be between 5 and 30 characters")
        .escape()
        .customSanitizer(firstname => {
            return toTitleCase(firstname);
        }),

    body("lastname")
        .trim().notEmpty().withMessage("Lastname is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Lastname must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Lastname must be between 5 and 30 characters")
        .escape()
        .customSanitizer(lastname => {
            return toTitleCase(lastname);
        }),

    body("role")
        .optional({ checkFalsy: true })
        .trim().toLowerCase()
        .matches(/^[A-Za-z\s]+$/).withMessage("Role must be alphabetic")
        .isIn(["admin", "farmer", "milk collector"]).withMessage("Invalid role")
        .escape(),

    body("active")
        .optional({ checkFalsy: true })
        .isInt().withMessage("Invalid value for active field")
        .toInt(),

    body("password")
        .trim().notEmpty().withMessage("Password is required")
        .isLength({min: 5, max: 30}).withMessage("Password must be at least 5 characters")
        .escape(),

    body("password2")
        .trim().notEmpty().withMessage("Please confirm your password")
        .custom( (password2, {req}) => {
            if (password2 !== req.body.password) {
                throw new Error("Password confirmation does not match password");
            }
            return true;
        })
];

userRules.edit = [

    body("firstname")
        .trim().notEmpty().withMessage("Firstname is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Firstname must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Firstname must be between 5 and 30 characters")
        .escape()
        .customSanitizer(firstname => {
            return toTitleCase(firstname);
        }),

    body("lastname")
        .trim().notEmpty().withMessage("Lastname is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Lastname must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Lastname must be between 5 and 30 characters")
        .escape()
        .customSanitizer(lastname => {
            return toTitleCase(lastname);
        }),

    body("role")
        .optional({ checkFalsy: true })
        .trim().toLowerCase()
        .matches(/^[A-Za-z\s]+$/).withMessage("Role must be alphabetic")
        .isIn(["admin", "farmer", "milk collector"]).withMessage("Invalid role")
        .escape(),

    body("active")
        .optional({ checkFalsy: true })
        .isInt().withMessage("Invalid value for active field")
        .toInt()
];

userRules.actions = [

    oneOf([
        check("userIds")
            .notEmpty().withMessage("An id array is required to perform action")
            .isArray({min: 1}).withMessage("User ids must be a non-empty array of integers")
            .custom( userIds => {
                userIds.forEach( (id, index, userIds) => {
                    if (!Number.isInteger(parseInt(id))) {
                        throw new Error(`Non-integer value ${id} found in id array`);
                    } else if (id <= 0) {
                        throw new Error("All ids must be greater than 0");
                    }
                    userIds[index] = parseInt(userIds[index]);
                });
                return true;
            })
            .customSanitizer(async userIds => {
                // remove ids that don't exist in db
                let temp = [];
                for (const id of userIds) {
                    const user = await User.findByPk(id);
                    if (user !== null) {
                        temp.push(id);
                    }
                }
                return temp;
            }),

        check("userIds")
            .notEmpty().withMessage("An id is required to perform action")
            .isInt().withMessage("A valid id must be an integer")
            .toInt()
            .custom( userId => {
                if (userId <= 0) {
                    throw new Error("A valid id must be greater than 0");
                }
                return true;
            }),
    ]),

    query("action")
        .notEmpty().withMessage("Action is required")
        .trim().isAlpha().withMessage("Action must be alphabetic")
        .escape()
        .isIn(["deleteSelected", "markInactive", "activateInactive"]).withMessage("Invalid action")
];

export { userRules }
