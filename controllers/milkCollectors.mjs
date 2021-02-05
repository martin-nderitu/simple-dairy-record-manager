import {User, MilkRecord} from "../models/user.mjs";
import {format} from "date-fns";
import {generatePaginator} from "../middlewares/paginator.mjs";
import {currentRate, sanitizedMilkRecords} from "../utils/models.mjs";
import isEmpty from "../utils/isEmpty.mjs";


async function index(req, res) {
    const context = res.locals.context || {};
    context.title = "My Records";
    context.columns = {     // sortBy select options to add in frontend
        id: {
            name: "ID", value: "id"
        },
        amount: {
            name: "Amount", value: "amount"
        },
        createdAt: {
            name: "Date", value: "createdAt"
        }
    };

    let paginator = res.locals.paginator || {};

    try {
        const {count, rows} = await MilkRecord.findAndCountAll({
            include: [{
                model: User,
                as: "farmer",
                attributes: { exclude: ["password"] }
            }],
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
        context.errors = {error: "Error getting records. Please try again"};
    }
    if (req.query.from) { req.query.from = format(req.query.from, "E MMM dd yyyy"); }
    if (req.query.to) { req.query.to = format(req.query.to, "E MMM dd yyyy"); }
    context.query = req.query;
    res.render("accounts/milk-collectors/index", context);
}

async function addRecordView(req, res) {
    const context = res.locals.context || {};
    context.title = "Add Record";
    try {
        let rate = await currentRate();
        if (rate === null) {
            req.session.errors = { error: "Rate for today not found. Request the admin to add rate" };
            res.redirect("/accounts/milk-collectors/index");
        } else {
            res.render("accounts/milk-collectors/add", context);
        }
    } catch (error) {
        req.session.errors = { error: "Error getting current rate. Please try again" };
        res.redirect("/accounts/milk-collectors/index");
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
            req.session.message = { success: "Record added successfully"};
            res.redirect(`/milk-collectors/record/${newRecord.dataValues.id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "An error occurred adding record. Please try again"};
        res.redirect("/milk-collectors/record/add");
    }
}

async function editRecordView(req, res) {
    const context = res.locals.context || {};
    context.title = "Edit Record";
    const id = req.params.id;
    try {
        if (isEmpty(context.body)) {
            let record = await MilkRecord.findOne({
                include: [{
                        model: User,
                        as: "farmer",
                        attributes: {exclude: ["password"]}
                }],
                where: {id}
            });
            if (record === null) {
                req.session.errors = {error: "Record does not exist"};
                res.redirect("/milk-collectors/index");
            } else {
                context.record = record.sanitizedMilkRecord();
            }
        } else {
            context.record = context.body;
        }
        res.render("accounts/milk-collectors/edit", context);
    } catch (error) {
        req.session.errors = { error: "Error fetching record. Please try again"};
        res.redirect("/milk-collectors/index");
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
            res.redirect(`/milk-collectors/record/${id}/edit`);
        } else {
            req.session.message = { success: "Record edited successfully"};
            res.redirect(`/milk-collectors/record/${id}/edit`);
        }
    } catch (error) {
        req.session.errors = { error: "Error editing record. Please try again"};
        res.redirect(`/milk-collectors/record/${id}/edit`);
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
        res.redirect("/milk-collectors/index");
    } catch (error) {
        req.session.errors = { error: "Error deleting record. Please try again" };
        res.redirect(`/milk-collectors/record/${id}/edit`);
    }
}

export {
    index, addRecordView, addRecord, editRecordView, editRecord, destroyRecord
}