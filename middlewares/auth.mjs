/* Ensure user is logged in */
function userAuthenticated(req, res, next) {
    if (req.session.user) {
        if (req.session.user.active) { next(); }
        else {
            req.session.errors = { warning: "Your account is inactive. Please contact the admin"};
            res.redirect("back");
        }
    } else {
        req.session.message = { info: "Please login to continue" };
        res.redirect("/accounts/login");
    }
}

/* Redirect logged in users to their index page if they access login route */
function redirectIfAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.active) {
        req.session.message = { info: "You are already logged in" };

        switch (req.session.user.role) {
            case "admin":
                res.redirect("/admin/index");
                break;
            case "farmer":
                res.redirect("/farmers/index");
                break;
            case "milk collector":
                res.redirect("/milk-collectors/index");
                break;
            default:
                res.redirect("/");
        }
    } else {
        next();
    }
}

/* Ensure user is logged in and is an admin */
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === "admin") {
        if (req.session.user.active) { next(); }
        else {
            req.session.errors = { warning: "Your account is inactive. Please contact the admin" };
            req.session.context = { body: req.session.user};
            delete req.session.user;
            res.redirect("back");
        }
    } else {
        req.session.errors = { error: "Access denied. You are not authorized to view this page" };
        res.redirect("back");
    }
}

/* Ensure user is logged in and is a farmer */
function isFarmer(req, res, next) {
    if (req.session.user && req.session.user.role === "farmer") {
        if (req.session.user.active) { next(); }
        else {
            req.session.errors = { warning: "Your account is inactive. Please contact the admin" };
            req.session.context = { body: req.session.user};
            delete req.session.user;
            res.redirect("back");
        }
    } else {
        req.session.errors = { error: "Access denied. You are not authorized to view this page" };
        res.redirect("back");
    }
}

/* Ensure user is logged in and is a milk collector */
function isMilkCollector(req, res, next) {
    if (req.session.user && req.session.user.role === "milk collector") {
        if (req.session.user.active) { next(); }
        else {
            req.session.errors = { warning: "Your account is inactive. Please contact the admin" };
            req.session.context = { body: req.session.user};
            delete req.session.user;
            res.redirect("back");
        }
    } else {
        req.session.errors = { error: "Access denied. You are not authorized to view this page" };
        res.redirect("back");
    }
}

export {
    userAuthenticated, redirectIfAuthenticated,
    isAdmin, isFarmer, isMilkCollector
}
