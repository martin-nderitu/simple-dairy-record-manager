import { default as express } from "express";

import * as adminController from "../controllers/admin.mjs";
import { isAdmin, redirectIfAuthenticated } from "../middlewares/auth.mjs";
import { getContext } from "../middlewares/context.mjs";
import { paginator } from "../middlewares/paginator.mjs";
import { validate } from "../middlewares/validate.mjs";
import { userRules } from "../validators/user.mjs";
import { recordRules } from "../validators/record.mjs";
import { messageRules } from "../validators/message.mjs";
import { destroyOneRules } from "../validators/destroyOne.mjs";
import { faqRules } from "../validators/faqs.mjs";
import { queryConditions } from "../middlewares/queryConditions.mjs";
import { rateRules } from "../validators/rate.mjs";
import { reportRules } from "../validators/report.mjs";

export const router = express.Router();

router.get("/login", redirectIfAuthenticated, getContext, adminController.loginView);
router.post("/login", userRules.login, validate, adminController.login);
router.get("/logout", adminController.logout);
router.get("/logged-out", adminController.loggedOut);

router.get("/index", isAdmin, getContext, adminController.index);

router.get("/users", isAdmin, getContext, userRules.queries, validate,
    queryConditions.users, paginator, adminController.users);
router.get("/users/create", getContext, isAdmin, adminController.createUserView);
router.post("/users/create", isAdmin, userRules.create, validate, adminController.createUser);
router.get("/users/:id/edit", getContext, isAdmin, adminController.editUserView);
router.post("/users/:id/edit", isAdmin, userRules.edit, validate, adminController.editUser);
router.get("/users/:id/destroy", isAdmin, destroyOneRules, validate, adminController.destroyUser);
router.get("/users/actions", isAdmin, userRules.actions, validate, adminController.userActions);

router.get("/records", isAdmin, getContext, recordRules.queries, validate,
    queryConditions.milkRecords, paginator, adminController.records);
router.get("/record/add", isAdmin, getContext, adminController.addRecordView);
router.post("/record/add", isAdmin, recordRules.add, validate, adminController.addRecord);
router.get("/record/:id/edit", getContext, isAdmin, adminController.editRecordView);
router.post("/record/:id/edit", isAdmin, recordRules.edit, validate, adminController.editRecord);
router.get("/record/:id/destroy", isAdmin, destroyOneRules, validate, adminController.destroyRecord);
router.get("/records/actions", isAdmin, recordRules.actions, validate, adminController.recordActions);

router.get("/messages", isAdmin, getContext, messageRules.queries, validate,
    queryConditions.messages, paginator, adminController.messages);
router.get("/message/:id/view", getContext, isAdmin, adminController.messageView);
router.get("/message/:id/destroy", isAdmin, destroyOneRules, validate, adminController.destroyMessage);
router.get("/messages/actions", isAdmin, messageRules.actions, validate, adminController.messageActions);

router.get("/faqs", isAdmin, getContext, faqRules.queries, validate,
    queryConditions.faqs, paginator, adminController.faqs);
router.get("/faq/add", isAdmin, getContext, adminController.addFaqView);
router.post("/faq/add", isAdmin, faqRules.add, validate, adminController.addFaq);
router.get("/faq/:id/edit", getContext, isAdmin, adminController.editFaqView);
router.post("/faq/:id/edit", isAdmin, faqRules.edit, validate, adminController.editFaq);
router.get("/faq/:id/destroy", isAdmin, destroyOneRules, validate, adminController.destroyFaq);
router.get("/faqs/actions", isAdmin, faqRules.actions, validate, adminController.faqActions);

router.get("/rates", isAdmin, getContext, rateRules.queries, validate,
    queryConditions.rates, paginator, adminController.rates);
router.get("/rate/add", isAdmin, getContext, adminController.addRateView);
router.post("/rate/add", isAdmin, rateRules.create, validate, adminController.addRate);
router.get("/rate/:id/edit", getContext, isAdmin, adminController.editRateView);
router.post("/rate/:id/edit", isAdmin, rateRules.edit, validate, adminController.editRate);
router.get("/rate/:id/destroy", isAdmin, destroyOneRules, validate, adminController.destroyRate);
router.get("/rates/actions", isAdmin, rateRules.actions, validate, adminController.rateActions);

router.get("/reports", isAdmin, getContext, reportRules.queries, validate,
    queryConditions.reports, adminController.recordsReport);
