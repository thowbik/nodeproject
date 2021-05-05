import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

//Get all users
router.get("/allusers", [checkJwt], UserController.listAll);

//Get all users menu pages
router.get("/pages", [checkJwt], UserController.usermenu);

// Get one user
router.get(
  "/GetUserByID/:id([0-9]+)",
  [checkJwt],
  UserController.getOneById
);
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * path:
 *  /user/saveuser/:
 *    post:
 *      summary: Create a new user
 *      tags: [User]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref:  '#/components/schemas/User'
 */
//Create a new user
router.post("/saveuser", UserController.newUser);

//Edit one user
router.patch(
  "/:id([0-9]+)",
  [checkJwt],
  UserController.editUser
);

//Delete one user
router.delete(
  "/:id([0-9]+)",
  [checkJwt],
  UserController.deleteUser
);

//Get otp
router.get("/getotp/:mobileNumber([0-9]+)",   UserController.getOtp);

//Get otp
// For RRC quiz sending Password from DB instead of DB
// router.get("/getforgotpassword/:mobileNumber([0-9]+)",   UserController.getForgotPassword);

// Send stored password
router.get("/getforgotpassword/:mobileNumber([0-9]+)",   UserController.sendPasswordOnForgotPassword);

//Create a new user
router.post("/changepassword", [checkJwt], UserController.changePassword);

router.get("/studentListPerCollege", [checkJwt], UserController.getStudentListForCollege);

router.get("/collegeListPerUniv", [checkJwt], UserController.getCollegeListForUniv);

router.get("/getUserInfo/:userId([0-9]+)", [checkJwt], UserController.getUser);

router.get("/getCountsPerUniv", [checkJwt], UserController.getRegCountsPerUniversity);

router.get("/getCountsPerCollege", [checkJwt], UserController.getRegCountsPerCollege);

router.get("/getCollegeCountsPerUniv", [checkJwt], UserController.getCollegeWiseCountsPerUniversity);

router.get("/getParticipationCount", [checkJwt], UserController.getParticipantsCount);

router.post("/approveOne", [checkJwt], UserController.approveOne);


// router.get("/", [checkJwt],BaseController.universityFromClg);

export default router;