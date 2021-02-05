import { param } from "express-validator";

export const destroyOneRules = [

    param("id")
        .notEmpty().withMessage("An id is required to destroy object")
        .isInt().withMessage("A valid id must be an integer")
        .toInt()
];
