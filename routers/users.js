import { Router } from "express";
import notVerifiedController from "../controllers/users/not-verified.js";
import verifyController from "../controllers/users/verify.js";
import deleteController from "../controllers/users/delete.js";

const router = Router();

router.get("/all", notVerifiedController);
router.post("/verify", verifyController);
router.delete("/delete/:id", deleteController);

export default router;
