import { validationResult } from "express-validator";

export function validate(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        next();
    } else {
        const _errors = {}, context = {};

        errors.array().map(error => _errors[error.param] = error.msg);
        req.session.errors = _errors;
        console.log("\n\nErrors = ", req.session.errors,"\n\n");

        if (req.body) {
            context.body = req.body;
            console.log("\n\nBody = ", req.body,"\n\n");

        } else if (req.query) {
            context.query = req.query;
            console.log("\n\nQuery = ", req.query,"\n\n");
        } else if (req.params) {
            context.params = req.params;
        }

        req.session.context = context;
        res.redirect("back");
    }
}
