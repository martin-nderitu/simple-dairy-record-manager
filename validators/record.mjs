import { body, check, oneOf, query } from "express-validator";
import { MilkRecord, User } from "../models/user.mjs";

const recordRules = {};

recordRules.queries = [
    query("search")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Farmer id must be an integer greater than 1")
        .toInt(),

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
        .trim().escape(),

    query("to")
        .optional({ checkFalsy: true })
        .trim().escape()
];

recordRules.add = [

    body("farmerId")
        .notEmpty().withMessage("Farmer id is required")
        .isInt().withMessage("Farmer id should be an integer")
        .toInt()
        .custom( async farmerId => {
            let user = await User.findByPk(farmerId);
            if (user === null) {
                return Promise.reject("Invalid farmer id. User doesn't exist");
            } else if (user.dataValues.role !== "farmer") {
                return Promise.reject("Invalid farmer id. User not a farmer");
            }
            return true;
        }),

    body("amount")
        .notEmpty().withMessage("Amount is required")
        .isFloat({min: 1.00}).withMessage("Amount should be a valid number greater than 1.0")
        .toFloat(),

    body("shift")
        .notEmpty().withMessage("Shift is required")
        .trim().toLowerCase().isAlpha().withMessage("Shift must be alphabetic")
        .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift")
        .escape(),

];

recordRules.edit = [

    body("id")
        .notEmpty().withMessage("Record id is required")
        .isInt().withMessage("Record id should be an integer")
        .toInt()
        .custom( async id => {
            let record = await MilkRecord.findByPk(id);
            if (record === null) {
                return Promise.reject("Record doesn't exist");
            }
            return true;
        }),

    body("farmerId")
        .notEmpty().withMessage("Farmer id is required")
        .isInt().withMessage("Farmer id should be an integer")
        .toInt()
        .custom( async farmerId => {
            let user = await User.findByPk(farmerId);
            if (user === null) {
                return Promise.reject("Invalid farmer id. User doesn't exist");
            } else if (user.dataValues.role !== "farmer") {
                return Promise.reject("Invalid farmer id. User not a farmer");
            }
            return true;
        }),

    body("amount")
        .notEmpty().withMessage("Amount is required")
        .isFloat({min: 1.00}).withMessage("Amount must be a number greater than 1.0")
        .toFloat(),

    body("shift")
        .notEmpty().withMessage("Shift is required")
        .trim().toLowerCase().isAlpha().withMessage("Shift must be alphabetic")
        .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift")
        .escape()
];

recordRules.actions = [

    oneOf([
        check("milkRecordIds")
            .notEmpty().withMessage("An id array is required to perform action")
            .isArray({min: 1}).withMessage("Milk record ids must be a non-empty array of integers")
            .custom( milkRecordIds => {
                milkRecordIds.forEach( (id, index, milkRecordIds) => {
                    if (!Number.isInteger(parseInt(id))) {
                        throw new Error(`Non-integer value ${id} found in id array`);
                    } else if (id <= 0) {
                        throw new Error("All ids must be greater than 0");
                    }
                    milkRecordIds[index] = parseInt(milkRecordIds[index]);
                });
                return true;
            })
            .customSanitizer(async milkRecordIds => {
                // remove ids that don't exist in db
                let temp = [];
                for (const id of milkRecordIds) {
                    const milkRecord = await MilkRecord.findOne({where: {id}});
                    if (milkRecord !== null) {
                        temp.push(id);
                    }
                }
                return temp;
            }),

        check("milkRecordIds")
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

export { recordRules }

