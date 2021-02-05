import * as argon2 from "argon2";
import Sequelize from "sequelize";

import { User, Faq, MilkRecord, Rate } from "../models/user.mjs";
import { sanitizedFaqs, sanitizedMilkRecords, sanitizedUsers, sanitizedMessages,
    sanitizedRates, currentRate } from "../utils/models.mjs";
import {Message} from "../models/message.mjs";
import {generatePaginator} from "../middlewares/paginator.mjs";
import isEmpty from "../utils/isEmpty.mjs";

const Op = Sequelize.Op;

async function index(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Dashboard";
    let errors = {};

    try {
        const {count, rows} = await User.findAndCountAll();
        if (count) {
            let farmers = 0, milkCollectors = 0;
            for (const row of rows) {
                if (row.dataValues.role === "farmer") { ++farmers; }
                if (row.dataValues.role === "milk collector") { ++milkCollectors; }
            }
            context.users = { count, farmers, milkCollectors};
        }

    } catch (error){
        errors.error = "Error getting user details. Please try again";
    }

    try {
        const {count} = await MilkRecord.findAndCountAll();
        if (count) {
            context.milkRecords = { count, totalLitres: await MilkRecord.sum("amount") };
        }
    } catch (error) {
        errors.error = "Error getting milk record details. Please try again";
    }

    try {
        const rate = await currentRate();
        if (rate) { context.currentRate = rate.dataValues; }
    } catch (error) {
        errors.error = "Error getting current rate. Please try again";
    }

    if (!isEmpty(errors)) { context.errors = errors; }

    res.render("admin/index", context);
}

function loginView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Login";
    res.render("admin/login", context);
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: {email} });
        if (user.dataValues.role !== "admin") {
            req.session.errors = {danger: "Access Denied. Unauthorized user"};
            req.session.context = { body: req.body };
            res.redirect("/admin/login");
        } else {
            const passwordCorrect = await argon2.verify(user.dataValues.password, password);
            if (!passwordCorrect) {
                req.session.errors = {danger: "Incorrect email or password"};
                req.session.context = { body: req.body };
                res.redirect("/admin/login");
            } else {
                req.session.user = user.sanitizedUser();
                req.session.message = {success: "Admin login successful"};
                res.redirect("/admin/index");
            }
        }
    } catch (error) {
        req.session.errors = { warning: "An error occurred. Please try again"};
        req.session.context = { body: req.body };
        res.redirect("/admin/login");
    }
}

function logout(req, res) {
    if (req.session.user) {
        req.session.destroy();
        res.redirect("/admin/logged-out");
    }
}

function loggedOut(req, res) {
    const context = { title: "Admin | Logged Out" };
    res.render("admin/logged-out", context);
}

function createUserView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Create User";
    res.render("admin/users/create", context);
}

async function createUser(req, res) {
    const { email, firstname, lastname, role, password, active } = req.body;

    try {
        let newUser = await User.create({
            email, firstname, lastname, role, password, active
        });
        if (!newUser.dataValues) {
            req.session.errors = {warning: "An error occurred. Please try again"};
            req.session.context = {body: req.body};
            res.redirect("/admin/users/create");
        } else {
            req.session.message = { success: "User created successfully" };
            res.redirect("/admin/users");
        }
    } catch (error) {
        req.session.errors = { error: "Error creating user. Please try again"};
        req.session.context = { body: req.body };
        res.redirect("/admin/users/create");
    }
}

async function users(req, res) {
    const context = res.locals.context || {};
    context.title = "Users";
    context.columns = {     // sortBy select options to add in frontend
        id: {
            name: "ID", value: "id"
        },
        email: {
            name: "Email", value: "email"
        },
        firstname: {
            name: "Firstname", value: "firstname"
        },
        lastname: {
            name: "Lastname", value: "lastname"
        },
        createdAt: {
            name: "Created At", value: "createdAt"
        },
        updatedAt: {
            name: "Updated At", value: "updatedAt"
        }
    };
    context.query = req.query;

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await User.findAndCountAll({
            where: context.condition,
            order: context.order,
            offset: paginator.offset,
            limit: paginator.limit,
            attributes: { exclude: ["password"]}
        });

        if (count) {
            context.count = count;
            context.users = sanitizedUsers(rows);
            const lastPage = Math.ceil(count / paginator.limit);
            context.paginator = generatePaginator(paginator, lastPage, count);
        }
    } catch (error) {
        context.errors = { error: "Error fetching users. Please try again"};
    }
    res.render("admin/users/index", context);
}

async function editUserView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Edit User";
    try {
        const user = await User.findByPk(req.params.id);
        if (user === null) {
            req.session.errors = {error: "User does not exist"};
            res.redirect("/admin/users");
        } else {
            context.userData = context.body ? { ...user.dataValues, ...context.body } : user.dataValues;
            res.render("admin/users/edit", context);
        }
    } catch (error) {
        req.session.errors = { error: "Error fetching user. Please try again" };
        res.redirect("/admin/users");
    }
}

async function editUser(req, res) {
    let { id, firstname, lastname, role, active } = req.body;

    try {
        let updatedUser = await User.update({
            firstname, lastname, role, active
        }, { where: { id }});

        if (updatedUser[0] !== 1) {
            req.session.errors = {danger: "A problem occurred editing user. Please try again"};
            res.redirect(`/admin/users/${id}/edit`);
        } else {
            req.session.message = {success: "User edited successfully"};
            res.redirect(`/admin/users/${id}/edit`);
        }
    } catch (error) {
        req.session.errors = {error: "Error editing user. Please try again"};
        res.redirect(`/admin/users/${id}/edit`);
    }
}

async function destroyUser(req, res) {
    const id = req.params.id;
    try {
        const user = await User.findByPk(req.params.id);
        if (user !== null) {
            const rowsDeleted = await User.destroy({where: {id}});
            if (rowsDeleted !== 1) {
                req.session.errors = {danger: "Error deleting user. Please try again."};
                res.redirect("/admin/users");
            }
            req.session.message = {success: "User deleted successfully"};
            res.redirect("/admin/users");
        } else {
            req.session.errors = {danger: "User not deleted. Invalid id"};
            res.redirect("/admin/users");
        }
    } catch (error) {
        req.session.errors = { danger: "Error deleting user. Please try again"};
        res.redirect("/admin/users");
    }
}

async function userActions(req, res) {
    const {userIds, action} = req.query;
    const idLen = Array.isArray(userIds) ? userIds.length : 1;  // userIds can be array or int
    const condition = idLen === 1 ? { id: userIds } : { id: { [Op.in]: userIds } };

    switch (action) {
        case "deleteSelected":
            try {
                const rowsDeleted = await User.destroy({where: {id: userIds}});
                if (rowsDeleted !== idLen) {
                    req.session.errors = { error: `${idLen - rowsDeleted} rows not deleted. Please try again`};
                    res.redirect("/admin/users");
                } else {
                    req.session.message = { success: `${rowsDeleted} users deleted successfully`};
                    res.redirect("/admin/users");
                }
            } catch (error) {
                req.session.errors = { danger: "Error deleting selected users. Please try again"};
                res.redirect("/admin/users");
            }
            break;

        case "markInactive":
            try {
                let result = await User.update( { active: 0 }, { where: condition });
                const rows = result[0];

                if (rows !== idLen) {
                    req.session.errors = {
                        danger: `${idLen - rows} users were not marked inactive. Please try again`
                    };
                    res.redirect("/admin/users/");
                } else {
                    req.session.message = {success: `${rows} user(s) marked inactive`};
                    res.redirect("/admin/users/");
                }
            } catch (error) {
                req.session.errors = { danger: "Error marking selected users inactive. Please try again"};
                res.redirect("/admin/users");
            }
            break;

        case "activateInactive":
            try {
                let result = await User.update( { active: 1 }, { where: condition });
                const rows = result[0];

                if (rows !== idLen) {
                    req.session.errors = {
                        danger: `${idLen - rows} users were not activated. Please try again`
                    };
                    res.redirect("/admin/users/");
                } else {
                    req.session.message = {success: `${rows} user(s) activated`};
                    res.redirect("/admin/users/");
                }
            } catch(error) {
                req.session.errors = { danger: "Error activating selected users. Please try again"};
                res.redirect("/admin/users");
            }
            break;

        default:
            res.redirect("/admin/users/");
            break;
    }
}

async function records(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Milk Records";
    context.columns = {
        id: {
            name: "ID", value: "id"
        },
        amount: {
            name: "Amount", value: "amount"
        },
        shift: {
            name: "Shift", value: "shift"
        },
        createdAt: {
            name: "Created At", value: "createdAt"
        },
        updatedAt: {
            name: "Updated At", value: "updatedAt"
        }
    };
    context.query = req.query;

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await MilkRecord.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "farmer",
                    attributes: { exclude: ["password"] }
                },
                {
                    model: User,
                    as: "milkCollector",
                    attributes: { exclude: ["password"] }
                },
                {
                    model: Rate,
                    as: "rate"
                }
            ],
            where: context.condition,
            order: context.order,
            offset: paginator.offset,
            limit: paginator.limit
        });
        if (count) {
            context.count = count;
            context.milkRecords = sanitizedMilkRecords(rows);
            const lastPage = Math.ceil(count / paginator.limit);
            context.paginator = generatePaginator(paginator, lastPage, count);
        }
    } catch (error) {
        context.errors = { error: "Error getting records. Please try again"}
    }

    try {
        const rate = await currentRate();
        if (rate) { context.currentRate = rate; }
    } catch (error) {
        context.errors = { error: "Error getting current rate. Please try again"}
    }
    res.render("admin/records/index", context);
}

async function addRecordView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Add Record";
    try {
        let rate = await currentRate();
        if (rate === null) {
            req.session.errors = { error: "Rate for today not found. Please add rate before entering record" };
            res.redirect("/admin/rate/add");
        } else {
            res.render("admin/records/add", context);
        }
    } catch (error) {
        req.session.errors = { error: "Error getting current rate. Please try again" };
        res.redirect("/admin/records");
    }
}

async function addRecord(req, res) {
    const {amount, shift, farmerId} = req.body;
    let rate;

    try {
        rate = await currentRate();
        if (rate === null) {
            req.session.errors = {error: "Current rate not found. Please add current rate before adding record"};
            res.redirect("/admin/records");
        } else {
            rate = rate.dataValues;
        }
    } catch (error) {
        req.session.errors = {error: "Error getting current rate. Please try again"};
        res.redirect("/admin/records");
    }

    try {
        let newRecord = await MilkRecord.create({
            amount, shift, farmerId, milkCollectorId: req.session.user.id, rateId: rate.id
        });
        if (newRecord.dataValues) {
            req.session.message = {success: "Record added successfully"};
            res.redirect(`/admin/record/${newRecord.dataValues.id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error adding record. Please try again"};
        res.redirect("/admin/record/add");
    }
}

async function editRecordView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Edit Record";
    const id = req.params.id;
    try {
        if (isEmpty(context.body)) {
            let record = await MilkRecord.findOne({
                include: [
                    {
                        model: User,
                        as: "farmer",
                        attributes: {exclude: ["password"]}
                    },
                    {
                        model: User,
                        as: "milkCollector",
                        attributes: {exclude: ["password"]}
                    }
                ],
                where: {id}
            });
            if (record === null) {
                req.session.errors = {error: "Record does not exist"};
                res.redirect("/admin/records");
            } else {
                context.record = record.sanitizedMilkRecord();
            }
        } else {
            context.record = context.body;
        }
        res.render("admin/records/edit", context);
    } catch (error) {
        req.session.errors = { error: "Error fetching record. Please try again"};
        res.redirect("/admin/records");
    }
}

async function editRecord(req, res) {
    let { id, amount, shift, farmerId } = req.body;

    try {
        let updatedRecord = await MilkRecord.update({
            amount, shift, farmerId
        }, { where: { id }});

        if (updatedRecord[0] !== 1) {
            req.session.errors = { error: "Error editing record. Please try again" };
            res.redirect(`/admin/record/${id}/edit`);
        } else {
            req.session.message = { success: "Record edited successfully"};
            res.redirect(`/admin/record/${id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error editing record. Please try again"};
        res.redirect(`/admin/record/${id}/edit`);
    }
}

async function destroyRecord(req, res) {
    const id = req.params.id;
    try {
        const rowsDeleted = await MilkRecord.destroy({where: {id}});
        if (rowsDeleted !== 1) {
            req.session.errors = {error: "An error occurred. Please try again"};
        } else {
            req.session.message = {success: "Record deleted successfully"};
        }
        res.redirect("/admin/records");
    } catch (error) {
        req.session.errors = { error: "Error deleting record. Please try again" };
        res.redirect(`/admin/record/${id}/edit`);
    }
}

async function recordActions(req, res) {
    const {milkRecordIds, action} = req.query;
    const idLen = Array.isArray(milkRecordIds) ? milkRecordIds.length : 1;  // milkRecordIds can be array or int

    if (action === "deleteSelected") {
        try {
            const rowsDeleted = await MilkRecord.destroy({where: {id: milkRecordIds}});
            if (rowsDeleted !== idLen) {
                req.session.errors = { error: `${idLen - rowsDeleted} rows not deleted. Please try again`};
                res.redirect("/admin/records");
            } else {
                req.session.message = {success: `${rowsDeleted} milk record(s) deleted successfully`};
                res.redirect("/admin/records");
            }
        } catch (error) {
            req.session.errors = {danger: "Error deleting selected records. Please try again"};
            res.redirect("/admin/records");
        }
    } else {
        res.redirect("/admin/records");
    }
}

async function messages(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Messages";
    context.columns = {     // sortBy select options to add in frontend
        id: {
            name: "ID", value: "id"
        },
        email: {
            name: "Email", value: "email"
        },
        name: {
            name: "Name", value: "name"
        },
        subject: {
            name: "Subject", value: "subject"
        },
        createdAt: {
            name: "Created At", value: "createdAt"
        },
        updatedAt: {
            name: "Updated At", value: "updatedAt"
        }
    };
    context.query = req.query;

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await Message.findAndCountAll({
            where: context.condition,
            order: context.order,
            offset: paginator.offset,
            limit: paginator.limit
        });

        if (count) {
            context.count = count;
            context.messages = sanitizedMessages(rows);
            const lastPage = Math.ceil(count / paginator.limit);
            context.paginator = generatePaginator(paginator, lastPage, count);
        }
    } catch (error) {
        context.errors = { error: " Error fetching messages. Please try again" };
    }
    res.render("admin/messages/index", context);
}

async function messageView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | View Message";

    try {
        let message = await Message.findByPk(req.params.id);
        if (message === null) {
            req.session.errors = {error: "Message does not exist"};
            res.redirect("/admin/messages")
        } else {
            context.message = message.dataValues;
            res.render("admin/messages/view", context);
        }
    } catch (error) {
        req.session.errors = { error: "Error fetching message. Please try again"};
        res.redirect("/admin/messages");
    }
}

async function destroyMessage(req, res) {
    const id = req.params.id;
    try {
        const rowsDeleted = await Message.destroy({where: {id}});
        if (rowsDeleted !== 1) {
            req.session.errors = {error: "An error occurred. Please try again"};
        } else {
            req.session.message = {success: "Message deleted successfully"};
        }
        res.redirect("/admin/messages");
    } catch (error) {
        req.session.errors = { error: "Error deleting message. Please try again" };
        res.redirect(`/admin/message/${id}`);
    }
}

async function messageActions(req, res) {
    const {messageIds, action} = req.query;
    const idLen = Array.isArray(messageIds) ? messageIds.length : 1;  // messageIds can be array or int

    if (action === "deleteSelected") {
        try {
            const rowsDeleted = await Message.destroy({where: {id: messageIds}});
            if (rowsDeleted !== idLen) {
                req.session.errors = { error: `${idLen - rowsDeleted} rows not deleted. Please try again`};
                res.redirect("/admin/messages");
            } else {
                req.session.message = {success: `${rowsDeleted} message(s) deleted successfully`};
                res.redirect("/admin/messages");
            }
        } catch (error) {
            req.session.errors = {danger: "Error deleting selected messages. Please try again"};
            res.redirect("/admin/messages");
        }
    } else {
        res.redirect("/admin/messages");
    }
}

async function faqs(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Faqs";
    context.columns = {
        id: {
            name: "ID", value: "id"
        },
        authorId: {
            name: "Author Id", value: "authorId"
        },
        createdAt: {
            name: "Created At", value: "createdAt"
        },
        updatedAt: {
            name: "Updated At", value: "updatedAt"
        }
    };
    context.query = req.query;

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await Faq.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: { exclude: ["password"] }
                }
            ],
            where: context.condition,
            order: context.order,
            offset: paginator.offset,
            limit: paginator.limit
        });

        if (count) {
            context.count = count;
            context.faqs = sanitizedFaqs(rows);
            const lastPage = Math.ceil(count / paginator.limit);
            context.paginator = generatePaginator(paginator, lastPage, count);
        }
    } catch (error) {
        context.errors = { error: "Error fetching faqs. Please try again" };
    }
    res.render("admin/faqs/index", context);
}

async function addFaqView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Add Faq";
    res.render("admin/faqs/add", context);
}

async function addFaq(req, res) {
    const {question, answer} = req.body;

    try {
        let newFaq = await Faq.create({
            question, answer, authorId: req.session.user.id
        });
        if (newFaq.dataValues) {
            req.session.message = { success: "Faq added successfully"};
            res.redirect(`/admin/faq/${newFaq.dataValues.id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error adding faq. Please try again"};
        res.redirect("/admin/faq/add");
    }
}

async function editFaqView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Edit Faq";
    const id = req.params.id;
    try {
        if (isEmpty(context.body)) {
            let faq = await Faq.findOne({
                include: [{
                    model: User,
                    as: "author",
                    attributes: {exclude: ["password"]}
                }],
                where: {id}
            });
            if (faq === null) {
                req.session.errors = {error: "Faq does not exist"};
                res.redirect("/admin/faqs");
            } else {
                if(!isEmpty(faq.dataValues.author)) {
                    faq.dataValues.author = faq.dataValues.author.sanitizedUser();
                }
                context.faq = faq.dataValues;
            }
        } else {
            context.faq = context.body;
        }
        res.render("admin/faqs/edit", context);
    } catch (error) {
        req.session.errors = { error: "Error fetching faq. Please try again"};
        res.redirect("/admin/faqs");
    }
}

async function editFaq(req, res) {
    let { id, question, answer } = req.body;

    try {
        let updatedFaq = await Faq.update( { question, answer }, { where: { id } } );

        if (updatedFaq[0] !== 1) {
            req.session.errors = { error: "Error editing faq. Please try again" };
            res.redirect(`/admin/faq/${id}/edit`);
        } else {
            req.session.message = { success: "Faq edited successfully"};
            res.redirect(`/admin/faq/${id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error editing faq. Please try again"};
        res.redirect(`/admin/faq/${id}/edit`);
    }
}

async function destroyFaq(req, res) {
    const id = req.params.id;
    try {
        const rowsDeleted = await Faq.destroy({where: { id }});
        if (rowsDeleted !== 1) {
            req.session.errors = {error: "An error occurred. Please try again"};
        } else {
            req.session.message = {success: "Faq deleted successfully"};
        }
        res.redirect("/admin/faqs");
    } catch (error) {
        req.session.errors = { error: "Error deleting faq. Please try again" };
        res.redirect(`/admin/faq/${id}/edit`);
    }
}

async function faqActions(req, res) {
    const {faqIds, action} = req.query;
    const idLen = Array.isArray(faqIds) ? faqIds.length : 1;  // faqIds can be array or int

    if (action === "deleteSelected") {
        try {
            const rowsDeleted = await Faq.destroy({where: {id: faqIds}});
            if (rowsDeleted !== idLen) {
                req.session.errors = { error: `${idLen - rowsDeleted} rows not deleted. Please try again`};
                res.redirect("/admin/faqs");
            } else {
                req.session.message = {success: `${rowsDeleted} faq(s) deleted successfully`};
                res.redirect("/admin/faqs");
            }
        } catch (error) {
            req.session.errors = {danger: "Error deleting selected faqs. Please try again"};
            res.redirect("/admin/faqs");
        }
    } else {
        res.redirect("/admin/faqs");
    }
}

async function rates(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Rates";
    context.columns = {     // sortBy select options to add in frontend
        id: {
            name: "ID", value: "id"
        },
        from: {
            name: "From", value: "from"
        },
        to: {
            name: "To", value: "to"
        },
        rate: {
          name: "Rate", value: "rate"
        },
        userId: {
            name: "SetBy (id)", value: "userId"
        },
        createdAt: {
            name: "Created At", value: "createdAt"
        },
        updatedAt: {
            name: "Updated At", value: "updatedAt"
        }
    };
    context.query = req.query;

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await Rate.findAndCountAll({
            include: [{
                model: User,
                as: "setter",
                attributes: { exclude: ["password"] }
            }],
            where: context.condition,
            order: context.order,
            offset: paginator.offset,
            limit: paginator.limit
        });

        if (count) {
            context.count = count;
            context.rates = sanitizedRates(rows);
            const lastPage = Math.ceil(count / paginator.limit);
            context.paginator = generatePaginator(paginator, lastPage, count);
        }
    } catch (error) {
        context.errors = { error: "Error fetching rates. Please try again" };
    }

    try {
        const rate = await currentRate();
        if (rate) { context.currentRate = rate; }
    } catch (error) {
        context.errors = { error: "Error getting current rate. Please try again"}
    }
    res.render("admin/rates/index", context);
}

async function addRateView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Add Rate";
    res.render("admin/rates/add", context);
}

async function addRate(req, res) {
    const {from, to, rate} = req.body;

    try {
        let newRate= await Rate.create({
            from, to, rate, setterId: req.session.user.id
        });
        if (newRate.dataValues) {
            req.session.message = { success: "Rate added successfully"};
            res.redirect(`/admin/rate/${newRate.dataValues.id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error adding rate. Please try again"};
        res.redirect("/admin/rate/add");
    }
}

async function editRateView(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Edit Rate";
    const id = req.params.id;
    try {
        if (isEmpty(context.body)) {
            let rate = await Rate.findOne({
                include: [{
                    model: User,
                    as: "setter",
                    attributes: {exclude: ["password"]}
                }],
                where: {id}
            });
            if (rate === null) {
                req.session.errors = {error: "Rate does not exist"};
                res.redirect("/admin/rates");
            } else {
                rate = rate.dataValues;
                if(!isEmpty(rate.setter)) { rate.setter = rate.setter.sanitizedUser(); }
                context.rate = rate;
            }
        } else {
            context.rate = context.body;
        }
        res.render("admin/rates/edit", context);
    } catch (error) {
        req.session.errors = { error: "Error fetching rate. Please try again"};
        res.redirect("/admin/rates");
    }
}

async function editRate(req, res) {
    let { id, from, to, rate } = req.body;

    try {
        let updatedRate = await Rate.update( { from, to, rate }, { where: { id } } );

        if (updatedRate[0] !== 1) {
            req.session.errors = { error: "Error editing rate. Please try again" };
            res.redirect(`/admin/rate/${id}/edit`);
        } else {
            req.session.message = { success: "Rate edited successfully"};
            res.redirect(`/admin/rate/${id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error editing rate. Please try again"};
        res.redirect(`/admin/rate/${id}/edit`);
    }
}

async function destroyRate(req, res) {
    const id = req.params.id;
    try {
        const rowsDeleted = await Rate.destroy({where: { id }});
        if (rowsDeleted !== 1) {
            req.session.errors = {error: "An error occurred. Please try again"};
        } else {
            req.session.message = {success: "Rate deleted successfully"};
        }
        res.redirect("/admin/rates");
    } catch (error) {
        req.session.errors = { error: "Error deleting rate. Please try again" };
        res.redirect(`/admin/rate/${id}/edit`);
    }
}

async function rateActions(req, res) {
    const {rateIds, action} = req.query;
    const idLen = Array.isArray(rateIds) ? rateIds.length : 1;  // rateIds can be array or int

    if (action === "deleteSelected") {
        try {
            const rowsDeleted = await Rate.destroy({where: {id: rateIds}});
            if (rowsDeleted !== idLen) {
                req.session.errors = { error: `${idLen - rowsDeleted} rows not deleted. Please try again`};
                res.redirect("/admin/rates");
            } else {
                req.session.message = {success: `${rowsDeleted} rate(s) deleted successfully`};
                res.redirect("/admin/rates");
            }
        } catch (error) {
            req.session.errors = {danger: "Error deleting selected rates. Please try again"};
            res.redirect("/admin/rates");
        }
    } else {
        res.redirect("/admin/rates");
    }
}

async function recordsReport(req, res) {
    const context = res.locals.context || {};
    context.title = "Admin | Reports";
    context.query = req.query;

    try {
        let {count, rows} = await MilkRecord.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "farmer",
                    attributes: { exclude: ["password"] }
                },
                {
                    model: Rate,
                    as: "rate"
                }
            ],
            where: context.condition,
            order: context.order
        });
        if (count) {
            let report = {};
            context.count = count;
            rows = sanitizedMilkRecords(rows);
            for (let row of rows) {
                let id = row.farmerId;
                if (report[id]) {
                    report[id].totalLitres += row.amount;
                    report[id].total = report[id].rate * report[id].totalLitres;

                } else {
                    report[id] = {
                        id: row.id, farmerId: id, farmer: row.farmer.fullName, rate: row.rate.rate,
                        totalLitres: row.amount
                    }
                    report[id].total = report[id].rate * report[id].totalLitres;
                }
            }
            context.report = report;
        }
    } catch (error) {
        context.errors = { error: `Error generating report. Please try again`}
    }
    res.render("admin/reports/index", context);
}


export {
    index, loginView, login, logout, loggedOut, createUserView, createUser,
    users, editUserView, editUser, destroyUser, userActions,
    records, addRecordView, addRecord, editRecordView, editRecord, destroyRecord, recordActions,
    messages, messageView, destroyMessage, messageActions,
    faqs, addFaqView, addFaq, editFaqView, editFaq, destroyFaq, faqActions,
    rates, addRateView, addRate, editRateView, editRate, destroyRate, rateActions,
    recordsReport
}
