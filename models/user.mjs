import Sequelize from "sequelize";
import * as argon2 from "argon2";
import {format} from "date-fns";

import db from "./index.mjs";

const sequelize = db.sequelize;


const User = sequelize.define("User", {
    id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true,
        unique: true, allowNull: false
    },
    email: { type: Sequelize.DataTypes.STRING, unique: true, allowNull: false },
    firstname: { type: Sequelize.DataTypes.STRING, allowNull: false},
    lastname: { type: Sequelize.DataTypes.STRING, allowNull: false},
    role: {
        type: Sequelize.DataTypes.ENUM("admin", "farmer", "milk collector"),
        allowNull: false, defaultValue: "farmer"
    },
    password: { type: Sequelize.DataTypes.STRING, allowNull: false},
    active: {
        type: Sequelize.DataTypes.BOOLEAN, allowNull: false, defaultValue: true
    },
}, {
    tableName: "Users",
});
User.beforeCreate(async (user, options) => {
    user.password = await argon2.hash(user.password);
});

const MilkRecord = sequelize.define("MilkRecord", {
    id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true,
        unique: true, allowNull: false
    },
    amount: { type: Sequelize.DataTypes.DECIMAL(10, 2), allowNull: false},
    shift: {
        type: Sequelize.DataTypes.ENUM("morning", "afternoon", "evening"),
        allowNull: false
    },
}, {
    tableName: "MilkRecords",
});

const Rate = sequelize.define("Rate", {
    id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true,
        unique: true, allowNull: false
    },
    from: {
        type: Sequelize.DataTypes.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW
    },
    to: {
        type: Sequelize.DataTypes.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW
    },
    rate: {
        type: Sequelize.DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00
    }
}, {
    tableName: "Rates",
});

const Faq = sequelize.define("Faq", {
    id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true,
        unique: true, allowNull: false
    },
    question: { type: Sequelize.DataTypes.STRING, allowNull: false },
    answer: { type: Sequelize.DataTypes.TEXT, allowNull: false },
}, {
    tableName: "Faqs"
});

User.hasMany(MilkRecord, {
    foreignKey: {
        name: "farmerId",
        allowNull: false
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

User.hasMany(MilkRecord, {
    foreignKey: {
        name: "milkCollectorId",
        allowNull: true
    },
    onDelete: "SET NULL",
    onUpdate: "SET NULL"
});

User.hasMany(Rate, {
    foreignKey: {
        name: "setterId",
        allowNull: true
    },
    onDelete: "SET NULL",
    onUpdate: "SET NULL"
});

User.hasMany(Faq, {
    foreignKey: {
        name: "authorId",
        allowNull: false
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


MilkRecord.belongsTo(User, {
    as: "farmer",
    foreignKey: "farmerId"
});

MilkRecord.belongsTo(User, {
    as: "milkCollector",
    foreignKey: "milkCollectorId"
});

MilkRecord.belongsTo(Rate, {
    as: "rate",
    foreignKey: {
        name: "rateId",
        allowNull: false
    }
});

Rate.belongsTo(User, {
    as: "setter",
    foreignKey: "setterId"
});

Rate.hasMany(MilkRecord, {
    foreignKey: {
        name: "rateId",
        allowNull: false
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});


Faq.belongsTo(User, {
    as: "author",
    foreignKey: "authorId"
});


User.prototype.sanitizedUser = function () {
    return {
        id: this.id, email: this.email,
        firstname: this.firstname, lastname: this.lastname,
        fullName: `${this.firstname} ${this.lastname}`, role: this.role,
        active: this.active,
        createdAt: format(this.createdAt, "E MMM dd yyyy HH:mm:ss"),
        updatedAt: format(this.updatedAt, "E MMM dd yyyy HH:mm:ss")
    };
}

MilkRecord.prototype.sanitizedMilkRecord = function() {
    return {
        id: this.id,
        amount: this.amount,
        shift: this.shift,
        farmerId: this.farmerId,
        milkCollectorId: this.milkCollectorId,
        rateId: this.rateId,
        createdAt: format(this.createdAt, "E MMM dd yyyy HH:mm:ss"),
        updatedAt: format(this.updatedAt, "E MMM dd yyyy HH:mm:ss"),
        farmer: this.farmer ? this.farmer.sanitizedUser() : undefined,
        milkCollector: this.milkCollector ? this.milkCollector.sanitizedUser() : undefined,
        rate: this.rate ? this.rate.sanitizedRate() : undefined
    }
}

Rate.prototype.sanitizedRate = function() {
    return {
        id: this.id,
        from: format(new Date(this.from), "E MMM dd yyyy"),
        to: format(new Date(this.to), "E MMM dd yyyy"),
        rate: this.rate,
        setterId: this.setterId,
        createdAt: format(this.createdAt, "E MMM dd yyyy HH:mm:ss"),
        updatedAt: format(this.updatedAt, "E MMM dd yyyy HH:mm:ss"),
        setter: this.setter ? this.setter.sanitizedUser() : undefined,
    }
}

Faq.prototype.sanitizedFaq = function() {
    return {
        id: this.id,
        question: this.question,
        answer: this.answer,
        authorId: this.authorId,
        createdAt: format(this.createdAt, "E MMM dd yyyy HH:mm:ss"),
        updatedAt: format(this.updatedAt, "E MMM dd yyyy HH:mm:ss"),
        author: this.author ? this.author.sanitizedUser() : undefined,
    }
}

export {
    User, MilkRecord, Rate, Faq
}