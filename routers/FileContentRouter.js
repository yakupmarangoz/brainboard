import controller from "../controllers/FileContentController.js";
import { authenticateJWTToken } from "../middleware/AuthenticationMiddleWare.js";
import { Router } from "express";
const router = Router();
router.use(authenticateJWTToken);
router.post("/content", controller.getNotebookContent);
export default router;