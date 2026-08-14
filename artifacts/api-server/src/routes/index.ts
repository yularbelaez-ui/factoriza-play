import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import classRouter from "./class";
import teacherRouter from "./teacher";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(classRouter);
router.use(teacherRouter);

export default router;
