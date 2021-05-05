import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import BaseController from "../controllers/BaseController";

const router = Router();

//Get all state
router.get("/state", BaseController.listAllState);
router.get("/emis", BaseController.listAllState);

// //Get all district
// router.get("/getdistricts/:stateId([0-9]+)",   BaseController.listAllDistrict);

// //Get all users menu pages
// router.get("/getroles", BaseController.listAllRoles);

// router.get("/universityList",  BaseController.universityList);

// // router.get("/collegeListOfUniv/:univeristyId([0-9]+)", BaseController.collegeList);

// router.get("/collegeName/:collegeId([0-9]+)", BaseController.collegeName);

// router.get("/collegeListofDt/:districtId([0-9]+)", BaseController.collegeListFromDt);

// router.get("/universityOfClg/:collegeId([0-9]+)", BaseController.universityFromClg);



export default router;