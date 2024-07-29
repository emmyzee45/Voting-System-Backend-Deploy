import express from "express";

import startController from "../controllers/polls/start.js";
import fetchController from "../controllers/polls/fetch.js";
import statusController from "../controllers/polls/status.js";
import endController from "../controllers/polls/end.js";
import resetController from "../controllers/polls/reset.js";
import votesController from "../controllers/polls/votes.js";
import voteController, { checkVoteability } from "../controllers/polls/vote.js";

const router = express.Router();

router.get("/", fetchController);
router.get("/status", statusController);
router.get("/votes", votesController);

router.post("/start", startController);
router.post("/end", endController);
router.post("/reset", resetController);
router.post("/check-voteability", checkVoteability);
router.post("/vote", voteController);

export default router;
