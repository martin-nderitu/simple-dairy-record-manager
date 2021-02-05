import { default as express } from "express";

import * as milkCollectorsController from "../controllers/milkCollectors.mjs";
import { getContext } from "../middlewares/context.mjs";
import { isMilkCollector } from "../middlewares/auth.mjs";
import { validate } from "../middlewares/validate.mjs";
import { queryConditions } from "../middlewares/queryConditions.mjs";
import { paginator } from "../middlewares/paginator.mjs";
import { recordRules } from "../validators/record.mjs";
import { destroyOneRules } from "../validators/destroyOne.mjs";

export const router = express.Router();

router.get("/index", isMilkCollector, getContext, recordRules.queries, validate,
    queryConditions.milkCollector, paginator, milkCollectorsController.index);
router.get("/record/add", isMilkCollector, getContext, milkCollectorsController.addRecordView);
router.post("/record/add", isMilkCollector, recordRules.add, validate, milkCollectorsController.addRecord);
router.get("/record/:id/edit", isMilkCollector, getContext, milkCollectorsController.editRecordView);
router.post("/record/:id/edit", isMilkCollector, recordRules.edit, validate, milkCollectorsController.editRecord);
router.get("/record/:id/destroy", isMilkCollector, destroyOneRules, validate,
    milkCollectorsController.destroyRecord);
