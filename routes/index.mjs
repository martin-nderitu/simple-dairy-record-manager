import { default as express } from "express";

import { router as publicRouter } from "./public.mjs";
import { router as accountsRoutes } from "./accounts.mjs";
import { router as adminRoutes } from "./admin.mjs";
import { router as farmerRoutes } from "./farmers.mjs";
import { router as milkCollectorRoutes } from "./milkCollectors.mjs";

export const router = express.Router();

router.use("/accounts", accountsRoutes);
router.use("/admin", adminRoutes);
router.use("/farmers", farmerRoutes);
router.use("/milk-collectors", milkCollectorRoutes);
router.use("/", publicRouter);




