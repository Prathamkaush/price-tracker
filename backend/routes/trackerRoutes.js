import express from "express";
import { getPrices } from "../controllers/trackerController.js";

const router = express.Router();

router.get("/track", getPrices);

export default router;
