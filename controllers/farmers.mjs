import {MilkRecord, Rate, User} from "../models/user.mjs";
import {format} from "date-fns";
import {generatePaginator} from "../middlewares/paginator.mjs";
import {currentRate, sanitizedMilkRecords} from "../utils/models.mjs";

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
            include: [
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
        context.error = { error: "Error getting records. Please try again"};
    }

    try {
        const rate = await currentRate();
        if (rate) { context.currentRate = rate; }
    } catch (error) {
        context.errors = { error: "Error getting current rate. Please try again"}
    }

    if (req.query.from) { req.query.from = format(req.query.from, "E MMM dd yyyy"); }
    if (req.query.to) { req.query.to = format(req.query.to, "E MMM dd yyyy"); }
    context.query = req.query;
    res.render("accounts/farmers/index", context);
}

export {
    index
}