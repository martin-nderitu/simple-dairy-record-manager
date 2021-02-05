import Sequelize from "sequelize";

const Op = Sequelize.Op;

function users(req, res, next) {
    const {search, role, sortBy, order, active} = req.query;
    let conditions = [],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (search) {
        if (Number.isInteger(search)) {
            conditions.push( {id: search} );
        } else {
            const innerCondition = {[Op.like]: `%${search}%`};
            conditions.push({
                [Op.or]: [
                    {email: innerCondition}, {firstname: innerCondition}, {lastname: innerCondition}
                ]
            });
        }
    }

    if (role) { conditions.push({ role }); }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (active) { conditions.push({ active }); }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function milkRecords(req, res, next) {
    let {search, shift, sortBy, order, from, to} = req.query;

    let conditions = [],
        ordering = [["id", "desc"]], // default ordering
        condition = {};

    if (search) {
        conditions.push({
            [Op.or]: [ {farmerId: search}, {milkCollectorId: search}]
        });
    }

    if (shift) { conditions.push({shift}); }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function farmer(req, res, next) {
    const {shift, sortBy, order, from, to} = req.query;
    let conditions = [{ farmerId: req.session.user.id }],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (shift) { conditions.push({ shift }); }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function milkCollector(req, res, next) {
    const {search, shift, sortBy, order, from, to} = req.query;
    let conditions = [{ milkCollectorId: req.session.user.id }],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (search) { conditions.push({ [Op.or]: [ {farmerId: search}] }); }

    if (shift) { conditions.push({ shift }); }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function messages(req, res, next) {
    const {search, sortBy, order, from, to} = req.query;
    let conditions = [],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (search) {
        const innerCondition = {[Op.like]: `%${search}%`};
        conditions.push({
            [Op.or]: [
                {email: innerCondition}, {name: innerCondition}, {subject: innerCondition}
            ]
        });
    }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function rates(req, res, next) {
    const {from, to, rate, setBy, sortBy, order} = req.query;
    let conditions = [],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (from) {
        conditions.push({
            from: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            to: { [Op.lte]: to }
        });
    }

    if (rate) {
        conditions.push({
            rate: { [Op.gte]: rate }
        });
    }

    if (setBy) { conditions.push({ userId: setBy }); }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function faqs(req, res, next) {
    const { search, sortBy, order, from, to } = req.query;
    let conditions = [],
        ordering = [["id", "desc"]],  // default ordering
        condition = {};

    if (search) {
        if (Number.isInteger(search)) {
            conditions.push( {authorId: search} );
        } else {
            const innerCondition = {[Op.like]: `%${search}%`};
            conditions.push({
                [Op.or]: [
                    {question: innerCondition}
                ]
            });
        }
    }

    if (sortBy && order) { ordering[0] = [sortBy, order]; }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}

function reports(req, res, next) {
    let {farmerId, shift, from, to} = req.query;

    let conditions = [],
        ordering = [["id", "desc"]], // default ordering
        condition = {};

    if (farmerId) { conditions.push({farmerId}); }

    if (shift) { conditions.push({shift}); }

    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from }
        });
    }

    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to }
        });
    }

    if (conditions.length) {
        condition = {
            [Op.and]: [conditions]
        };
    }

    res.locals.context.condition = condition;
    res.locals.context.order = ordering;
    next();
}


const queryConditions = { users, milkRecords, farmer, milkCollector, messages, rates, faqs, reports };

export { queryConditions };