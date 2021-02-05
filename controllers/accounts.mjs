import * as argon2 from "argon2";
import { User } from "../models/user.mjs";

function registerView(req, res) {
    const context = res.locals.context || {};
    context.title = "Register | Farmer";
    res.render("accounts/register", context);
}

async function register(req, res) {
    const { email, firstname, lastname, password } = req.body;

    try {
        let newUser = await User.create({
            email, firstname, lastname, role: "farmer", password
        });

        if (!newUser.dataValues) {
            req.session.errors = { warning: "An error occurred. Please try again" };
            req.session.context = { body: req.body };
            res.redirect("/accounts/register");
        } else {
            req.session.user = newUser.sanitizedUser();
            req.session.message = { success: "Registration successful" };
            res.redirect("/farmers/index");
        }
    } catch (error) {
        req.session.errors = { warning: "Error registering user. Please try again" };
        req.session.context = { body: req.body };
        res.redirect("/accounts/register");
    }
}

function loginView(req, res) {
    const context = res.locals.context || {};
    context.title = "Login";
    res.render("accounts/login", context);
}

async function login(req, res) {
    let { email, password } = req.body;

    try {
        const user = await User.findOne({where: {email}});
        const passwordCorrect = await argon2.verify(user.dataValues.password, password);

        if (!passwordCorrect) {
            req.session.errors = { danger: "Incorrect email or password"};
            req.session.context = { body: req.body };
            res.redirect("/accounts/login");
        } else {
            req.session.user = user.sanitizedUser();
            req.session.message = { success: "Login successful" };
            if (req.session.user.role === "farmer") {
                res.redirect("/farmers/index");
            } else if (req.session.user.role === "milk collector") {
                res.redirect("/milk-collectors/index");
            }
        }
    } catch (error) {
        req.session.errors = { warning: "An error occurred. Please try again"};
        req.session.context = { body: req.body };
        res.redirect("/accounts/login");
    }
}

function logout(req, res) {
    if (req.session.user) {
        req.session.destroy();
        res.redirect("/accounts/logged-out");
    }
}

function loggedOut(req, res) {
    const context = { title: "Logged Out" };
    res.render("accounts/logged-out", context);
}

export {
    registerView, register, loginView, login, logout, loggedOut
}