import { Router } from "express";
import controller from "../controllers/QuoteController.js";
const router = Router();
router.get("/",controller.getQuote);
export default router;