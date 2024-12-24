import controller from "../controllers/AuthenticationController.js";
import { Router } from "express";

const router = Router();

router.post("/create", controller.createUser);
router.post("/authenticate", controller.authenticateUser);

export default router;
