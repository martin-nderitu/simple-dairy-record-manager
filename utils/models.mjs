import Sequelize from "sequelize";
import {format} from "date-fns";
import {Rate} from "../models/user.mjs";
import {truncateSentence} from "./stringFormat.mjs";

const Op = Sequelize.Op;


function sanitizedUsers (rows) {
    let users = [];
    for (let row of rows) {
        row = row.dataValues;
        row.createdAt = format(row.createdAt, "E MMM dd yyyy HH:mm:ss");
        row.updatedAt = format(row.updatedAt, "E MMM dd yyyy HH:mm:ss");
        users.push(row);
    }
    return users;
}

function sanitizedMilkRecords (rows) {
    let milkRecords = [];
    for (let row of rows) {
        row = row.dataValues;
        if (row.farmer) { row.farmer = row.farmer.sanitizedUser(); }
        if (row.milkCollector) { row.milkCollector = row.milkCollector.sanitizedUser(); }
        if (row.rate) { row.rate = row.rate.sanitizedRate(); }
        row.createdAt = format(row.createdAt, "E MMM dd yyyy HH:mm:ss");
        row.updatedAt = format(row.updatedAt, "E MMM dd yyyy HH:mm:ss");
        milkRecords.push(row);
    }
    return milkRecords;
}

function sanitizedRates (rows) {
    let rates = [];
    for (let row of rows) {
        row = row.dataValues;
        row.from = format(new Date(row.from), "E MMM dd yyyy");
        row.to = format(new Date(row.to), "E MMM dd yyyy");
        if (row.setter) { row.setter = row.setter.sanitizedUser(); }
        row.createdAt = format(row.createdAt, "E MMM dd yyyy HH:mm:ss");
        row.updatedAt = format(row.updatedAt, "E MMM dd yyyy HH:mm:ss");
        rates.push(row);
    }
    return rates;
}

function sanitizedMessages (rows) {
    let messages = [];
    for (let row of rows) {
        row = row.dataValues;
        row.createdAt = format(row.createdAt, "E MMM dd yyyy HH:mm:ss");
        row.updatedAt = format(row.updatedAt, "E MMM dd yyyy HH:mm:ss");
        row.subject = truncateSentence(row.subject)
        row.message = truncateSentence(row.message);
        messages.push(row);
    }
    return messages;
}

function sanitizedFaqs (rows) {
    let faqs = [];
    for (let row of rows) {
        row = row.dataValues;
        if (row.author) { row.author = row.author.sanitizedUser(); }
        row.createdAt = format(row.createdAt, "E MMM dd yyyy HH:mm:ss");
        row.updatedAt = format(row.updatedAt, "E MMM dd yyyy HH:mm:ss");
        row.question = truncateSentence(row.question);
        row.answer = truncateSentence(row.answer);
        faqs.push(row);
    }
    return faqs;
}

async function currentRate () {
    const today = new Date().toJSON().substring(0,10);
    const condition = {
        [Op.and]: [
            {from: { [Op.lte]: today }}, {to: { [Op.gte]: today }}
        ]
    };
    return await Rate.findOne({ where: condition });
}

async function rateOverlapsOther(from, to) {
    const condition = {
        [Op.and]: [
            {from: { [Op.lte]: to }}, {to: { [Op.gte]: from}}
        ]
    };
    let { count } = await Rate.findAndCountAll({ where: condition });
    return count > 0;
}

async function rateOverlapsOnlyItself(from, to, rateId) {
    const condition = {
        [Op.and]: [
            {from: { [Op.lte]: to }}, {to: { [Op.gte]: from}}
        ]
    };
    let { count, rows } = await Rate.findAndCountAll({ where: condition });
    if (count) {
        for (const row of rows) {
            if (row.dataValues.id !== rateId) {
                return false;
            }
        }
    }
    return true;
}

export {
    sanitizedUsers, sanitizedMilkRecords, sanitizedMessages, sanitizedRates, sanitizedFaqs,
    currentRate, rateOverlapsOther, rateOverlapsOnlyItself,
}