import express from "express";
import { getSportRules } from "../controllers/sportController.js";

const router = express.Router();

router.get("/:id", getSportRules);

export default router;
