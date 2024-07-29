import { Router } from "express";
import checkController from "../controllers/auth/check.js";
import logoutController from "../controllers/auth/logout.js";

const router = Router();

// router.post("/login", loginController);
router.post("/check", checkController);
router.post("/logout", logoutController);
// router.post("/signup", signupController);

export default router;
