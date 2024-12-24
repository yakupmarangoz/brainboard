import { Router } from "express";
import controller from "../controllers/NotebookController.js";
import { authenticateJWTToken } from "../middleware/AuthenticationMiddleWare.js";
const router = Router();
router.use(authenticateJWTToken);
router.post("/create", controller.createNotebook);
router.post("/get",controller.getNotebook);
router.get("/all",  controller.getAllNotebooks);
router.delete("/delete", controller.deleteNotebook);
export default router;
