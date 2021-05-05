import { Router } from "express";
import EmisController from "../controllers/EmisController";

const router = Router();

//Get all state
router.get("/state", EmisController.listAllState);


export default router;