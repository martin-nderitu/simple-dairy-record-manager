import { default as express } from "express";

import * as farmersController from "../controllers/farmers.mjs";
import { getContext } from "../middlewares/context.mjs";
import { isFarmer } from "../middlewares/auth.mjs";
import { paginator } from "../middlewares/paginator.mjs";
import { farmerRules } from "../validators/farmer.mjs";
import { validate } from "../middlewares/validate.mjs";
import { queryConditions } from "../middlewares/queryConditions.mjs";


export const router = express.Router();

router.get("/index", isFarmer, getContext, farmerRules.queries, validate,
    queryConditions.farmer, paginator, farmersController.index);
