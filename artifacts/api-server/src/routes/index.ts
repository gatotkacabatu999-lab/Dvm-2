import { Router, type IRouter } from "express";
import healthRouter from "./health";
import routesRouter from "./routes";
import calendarRouter from "./calendar";
import notesRouter from "./notes";
import planoRouter from "./plano";
import roosterRouter from "./rooster";
import routeNotesRouter from "./route-notes";
import deliveriesRouter from "./deliveries";
import proxyImageRouter from "./proxy-image";
import shortenRouter from "./shorten";

const router: IRouter = Router();

router.use(healthRouter);
router.use(routesRouter);
router.use(calendarRouter);
router.use(notesRouter);
router.use(planoRouter);
router.use(roosterRouter);
router.use(routeNotesRouter);
router.use(deliveriesRouter);
router.use(proxyImageRouter);
router.use(shortenRouter);

export default router;
