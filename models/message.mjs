import Sequelize from "sequelize";
import db from "./index.mjs";

const sequelize = db.sequelize;

const Message = sequelize.define("Message", {
    id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true,
        unique: true, allowNull: false
    },
    email: { type: Sequelize.DataTypes.STRING, allowNull: false },
    name: { type: Sequelize.DataTypes.STRING, allowNull: false },
    subject: { type: Sequelize.DataTypes.STRING, allowNull: false},
    message: { type: Sequelize.DataTypes.TEXT, allowNull: false},
}, {
    tableName: "Messages"
});



export { Message }