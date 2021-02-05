import { default as express } from "express";
import session from "express-session";
import { default as hbs } from "hbs";
import { default as cookieParser } from "cookie-parser";
import { default as logger } from "morgan";
import path from "path";
import * as http from "http";
import dotenv from "dotenv";

import {__dirname} from "./constants.mjs";
import { router } from "./routes/index.mjs";
import { normalizePort, onError, onListening, errorHandler, handle404 } from "./appHelper.mjs";
import db from "./models/index.mjs";

export const app = express();
export const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

export const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
server.on("error", onError);
server.on("listening", onListening);

dotenv.config();

try {
    await db.sequelize.sync();
    console.log("All models were synchronized successfully.");
} catch (error) {
    console.error("Unable to synchronize models:", error);
}

try {
    await db.sequelize.authenticate();
    console.log("Connection established");
} catch(error) {
    console.error("Unable to connect to database:", error);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "partials"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets/vendor/bootstrap", express.static(
    path.join(__dirname, "node_modules", "bootstrap", "dist")));
app.use("/assets/css", express.static(
    path.join(__dirname, "public", "css")));
app.use("/assets/vendor/jquery", express.static(
    path.join(__dirname, "node_modules", "jquery", "dist")));
app.use("/assets/vendor/popper.js", express.static(
    path.join(__dirname, "node_modules", "popper.js", "dist", "umd")));
app.use("/assets/vendor/flatpickr", express.static(
    path.join(__dirname, "node_modules", "flatpickr", "dist")
));
app.use("/assets/js", express.static(
    path.join(__dirname, "public", "js")));

app.use("/", router);

app.use(handle404);

app.use(errorHandler);
