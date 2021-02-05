import {Message} from "../models/message.mjs";
import {Faq} from "../models/user.mjs";

async function index(req, res) {
    const context = res.locals.context || {};
    context.title = "Home";
    const {count, rows} = await Faq.findAndCountAll({ order: [["id", "desc"]] });
    if (context.user) { context.body = { email: context.user.email, name: context.user.fullName } };
    if (count) {
        context.faqs = [];
        for (const row of rows) { context.faqs.push(row.dataValues); }
    }
    res.render("index", context);
}

async function contactUs(req, res) {
    let { email, name, subject, message } = req.body;

    try {
        let msg = await Message.create({email, name, subject, message});
        if (msg.dataValues) {
            req.session.message = { success: "Message sent. Thank you for your input" };
        } else {
            req.session.errors = { error: "Message was not sent. Please try again" };
            req.session.context = { body: req.body }
        }
        res.redirect("/");
    } catch (error) {
        req.session.errors = { error: "Error sending message. Please try again."};
        req.session.context = { body: req.body }
        res.redirect("/");
    }
}

export {
    index, contactUs
}