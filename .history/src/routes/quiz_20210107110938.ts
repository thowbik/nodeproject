import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import QuizController from "../controllers/QuizController";

const router = Router();

//Get all users
router.get("/allquiz", [checkJwt], QuizController.listAll);

//Get all Question by quiz id
router.get("/getquestion/:quizId([0-9]+)", [checkJwt],  QuizController.listAllQuestion);

//Get all result by quiz id
router.get("/getquizresult/:quizId([0-9]+)", [checkJwt],  QuizController.listAllQuestionAndResult);


//Get all result by quiz id
router.get("/getquizleadboard/:quizId([0-9]+)",  QuizController.listLeadBoard);

router.get("/getcertificate/:userId([0-9]+)", [checkJwt],  QuizController.getCertificate);

router.get("/downloadcertificate", [checkJwt],   QuizController.getCertificateByteArray);

router.get("/getsamplequestion",  QuizController.listAllSampleQuestion);

router.get("/checkIfUserAnswered/:userId([0-9]+)", [checkJwt],   QuizController.checkIfUserAnswered);

router.get("/getdate",  QuizController.getdate);

//Create a new user
router.post("/saveanswer", [checkJwt], QuizController.saveanswer);

router.post("/saveanswerasstring", [checkJwt], QuizController.saveUserSelectedAns);

export default router;