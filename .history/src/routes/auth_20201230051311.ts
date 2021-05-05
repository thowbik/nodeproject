
import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();
//Login route
// router.post("/login", AuthController.login);

router.post("/login", AuthController.loginFromCache);

//Change my password
router.post("/change-password", [checkJwt], AuthController.changePassword);

router.post("/changepassword", [checkJwt], AuthController.changePasswordForRRC);

export default router;