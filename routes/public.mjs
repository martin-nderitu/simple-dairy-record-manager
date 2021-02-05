import { default as express } from "express";

import * as publicController from "../controllers/public.mjs";
import { getContext } from "../middlewares/context.mjs";
import { validate } from "../middlewares/validate.mjs";
import {messageRules} from "../validators/message.mjs";

export const router = express.Router();

router.get("/", getContext, publicController.index);
router.post("/contact-us", messageRules.create, validate, publicController.contactUs);
