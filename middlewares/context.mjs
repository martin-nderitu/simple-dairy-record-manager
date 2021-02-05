export function getContext(req, res, next) {
    let context = {};

    if (req.session.context) {
        context = req.session.context
        delete req.session.context;
    }

    if (req.session.message) {
        context.message = req.session.message;
        delete req.session.message;
    }

    if (req.session.errors) {
        context.errors = req.session.errors;
        delete req.session.errors;
    }

    if (req.session.user) {
        context.user = req.session.user;
    }

    res.locals.context = context;
    next();
}
