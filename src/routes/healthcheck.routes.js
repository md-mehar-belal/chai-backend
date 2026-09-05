import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();

// Public route (Is par verifyJWT middleware ki zaroorat nahi hoti)
router.route("/").get(healthcheck);

export default router;