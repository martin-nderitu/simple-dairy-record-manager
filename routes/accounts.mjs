import { default as express } from "express";

import * as usersController from "../controllers/accounts.mjs";
import { getContext } from "../middlewares/context.mjs";
import { redirectIfAuthenticated } from "../middlewares/auth.mjs";
import { validate } from "../middlewares/validate.mjs";
import { userRules } from "../validators/user.mjs";

export const router = express.Router();

router.get("/register", getContext, usersController.registerView);
router.post("/register", userRules.create, validate, usersController.register);
router.get("/login", redirectIfAuthenticated, getContext, usersController.loginView);
router.post("/login", userRules.login, validate, usersController.login);
router.get("/logout", usersController.logout);
router.get("/logged-out", usersController.loggedOut);
