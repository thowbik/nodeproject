import { Request, Response } from "express";
import { getRepository, LessThanOrEqual } from "typeorm";
import { validate } from "class-validator";
import { Quiz } from "../entity/Quiz";
import { Question } from "../entity/Question";
import { QuestionOption } from "../entity/QuestionOption";
import { QuestionAnswer } from "../entity/QuestionAnswer";
import { User } from "../entity/User";
import { LeadBoardView } from "../entity/LeadBoardView";
import { UserQuizMapping } from "../entity/UserQuizMapping";
import { District } from "../entity/District";
import { Config } from "../entity/Config";
import { Winner } from "../entity/Winner";
import questionCache  from "../cacheService/questionsCache.service";
import { QuestionSet } from "../entity/QuestionSet";
import { UserSelectedAnswers } from "../entity/UserSelectedAnswers";
const qstnCache = new questionCache()

class QuizController {

    static storeQstnsInCache = async () => {
        // const currentuserid: string = req.params.currentuserId.toString();
        const questionSetRepository = getRepository(QuestionSet);
        const questionSetList = await questionSetRepository.find({
            // where: { quizId: 7 },
            relations : ["Question", "Question.QuestionOption"]
        });
        const getQstns = questionSetList;
        qstnCache.storeByID( 'qstnsets', getQstns );
        // const value = qstnCache.get( "myKey" );
    }
  
    // static getQstnsStoredInCache = async () => {
       /*  const currentuserid: string = req.params.currentuserId.toString();
        const questionRepository = getRepository(Question);
        const questionList = await questionRepository.find({
            // where: { quizId: 7 },
        }); */
        // const getQstns = qstnCache.getStoredQstnByID( 'qstnsets');
        // console.log(getQstns)
        // const value = qstnCache.get( "myKey" );
    // }

    static listAll = async (req: Request, res: Response) => {
        // QuizController.getQstnsStoredInCache()
        const currentuserid: string = req.params.currentuserId.toString();

        //Get Quiz from database
        const quizRepository = getRepository(Quiz);
        const allQuiz = await quizRepository.find({
            where: { StatusType: true },
            select: ["Id", "Title", "StartDate", "EndDate"] //We dont want to send the passwords on response
        });
        const questionRepository = getRepository(Question);
        const questionList = await questionRepository.find(
            { relations: ["Quiz"] }
        );
        const questionAnswerRepository = getRepository(QuestionAnswer);
        const questionAnswerList = await questionAnswerRepository.find(
            {
                where: { User: { Id: currentuserid } }
            }
        );

        for (var i = 0; i < allQuiz.length; i++) {
            let selectedquestionAnswer = questionAnswerList.filter(item => item.quizId == allQuiz[i].Id && item.IsCompleteQuiz);
            allQuiz[i].isAnswered = selectedquestionAnswer.length > 0 ? true : false;
            let totalTime = 0;
            let allQuestion = questionList.filter(item => item.Quiz.Id == allQuiz[i].Id)
            allQuestion.forEach(element => {
                totalTime = totalTime + element.TimeAllocated;
            });
            var h = Math.floor(totalTime / 3600);
            var m = Math.floor(totalTime % 3600 / 60);
            var s = Math.floor(totalTime % 3600 % 60);
            allQuiz[i].totalQuestion = questionList.filter(item => item.Quiz.Id == allQuiz[i].Id).length;
            allQuiz[i].totalTime = m + ":" + s;
            allQuiz[i].isExpired = new Date(new Date().toUTCString()) > allQuiz[i].EndDate ? true : false;
            allQuiz[i].isOpened = new Date(new Date().toUTCString()) > allQuiz[i].StartDate && new Date(new Date().toUTCString()) < allQuiz[i].EndDate ? true : false;
        }
        //Send the Quiz object
        res.send(allQuiz);
    };
    static listAllQuestion = async (req: Request, res: Response) => {
        const currentuserid: string = req.params.currentuserId.toString();
        const userRepository = getRepository(User);
        const currentuser = await userRepository.findOneOrFail(currentuserid);

        //Get the SetID assigned for user and send questions matching setId
        const userSetId = currentuser.QuestionSetId;
        const getQstns = qstnCache.getStoredCacheByID( 'qstnsets');
        const getQstnsForSet = getQstns.filter(e  => e.questionSetId == userSetId );
        /* const OnlyQstnsOptions = getQstnsForSet.forEach(element => {
            element.question
        }); */
        const keys_to_keep = ['Question'];

        const OnlyQstnsOptions = getQstnsForSet.map(e => {
            const obj = {};
            keys_to_keep.forEach(k => obj[k] = e[k])
            return obj;
        });
        let result = OnlyQstnsOptions.map(a => a.Question);
        res.send(result);
        return 
        
        let questionList = [];
        let selectedquestionList = [];
        const quizId: string = req.params.quizId;
        const quizRepository = getRepository(Quiz);
        const quiz = await quizRepository.findOne({
            where: { StatusType: true, Id: quizId },
            select: ["Id", "Title", "StartDate", "EndDate"] //We dont want to send the passwords on response
        });

        if (new Date(new Date().toUTCString()) > quiz.StartDate && new Date(new Date().toUTCString()) < quiz.EndDate) {
            const questionRepository = getRepository(Question);
            let selecteQusIdList = [];

            questionList = await questionRepository.find({
                relations: ["QuestionOption"],
                // where: { quizId: quizId },
                where: { Quiz: { Id: quizId }, StatusType: true },

                select: ["Id", "Description", "QuestionType", "TimeAllocated", "TimeLeft", "SequenceNo", "WeightageType"]
            });

            const questionAnswerRepository = getRepository(QuestionAnswer);
            const questionAnswerList = await questionAnswerRepository.find({
                relations: ["Question", "QuestionOption"],
                where: { quizId: quizId, User: { Id: currentuserid } },
            });


            const userQuizMappingRepository = getRepository(UserQuizMapping);
            const userQuizMappingList = await userQuizMappingRepository.find({
                where: { quizId: quizId, userId: currentuserid },
                select: ["questionIdList"]

            });
            if (userQuizMappingList && userQuizMappingList.length > 0) {
                selecteQusIdList = userQuizMappingList[0].questionIdList.split(",");
            }
            else {
                let questionListWeightageType1 = questionList.filter(i => i.WeightageType == 1);
                let questionListWeightageType2 = questionList.filter(i => i.WeightageType == 2);
                let selectedQuestionListWeightageType1 = [];
                let selectedQuestionListWeightageType2 = [];
                for (let index = 0; 10 > selectedQuestionListWeightageType1.length; index++) {
                    let selectedQuestion = questionListWeightageType1[Math.floor(Math.random() * questionListWeightageType1.length)];
                    let oldList = selectedQuestionListWeightageType1.filter(i => i.Id == selectedQuestion.Id);
                    if (oldList && oldList.length > 0) {

                    }
                    else {
                        selectedQuestionListWeightageType1.push(selectedQuestion);
                    }
                }

                for (let index = 0; 5 > selectedQuestionListWeightageType2.length; index++) {
                    let selectedQuestion = questionListWeightageType2[Math.floor(Math.random() * questionListWeightageType2.length)];
                    let oldList = selectedQuestionListWeightageType2.filter(i => i.Id == selectedQuestion.Id);
                    if (oldList && oldList.length > 0) {

                    }
                    else {
                        selectedQuestionListWeightageType2.push(selectedQuestion);
                    }
                }
                selectedQuestionListWeightageType1.forEach(element => {
                    selecteQusIdList.push(element.Id);
                });
                selectedQuestionListWeightageType2.forEach(element => {
                    selecteQusIdList.push(element.Id);
                });

                let userQuizMapping = new UserQuizMapping();
                userQuizMapping.userId = parseInt(currentuserid);
                userQuizMapping.quizId = parseInt(quizId);
                userQuizMapping.questionIdList = selecteQusIdList.toString();
                userQuizMapping.CreationUserId = currentuser.Firstname + " " + currentuser.Lastname;
                userQuizMapping.LastChangeUserId = currentuser.Firstname + " " + currentuser.Lastname;
                userQuizMapping.StatusType = true;
                const userQuizMappingRepository = getRepository(UserQuizMapping);
                await userQuizMappingRepository.save(userQuizMapping);
            }

            questionList.forEach(question => {
                selecteQusIdList.forEach(element => {
                    if (question.Id == element)
                        selectedquestionList.push(question);
                });
            });
            selectedquestionList.forEach((element, key) => {
                element.SequenceNo = key + 1;
            });
            selectedquestionList.forEach(question => {
                let anyQuestionIsCompleteQuiz = questionAnswerList.filter(item => item.IsCompleteQuiz == true);
                if (anyQuestionIsCompleteQuiz.length > 0) {
                    question.IsCompleteQuiz = true;
                }
                let selectedqus = questionAnswerList.filter(item => item.Question.Id == question.Id)
                if (selectedqus.length > 0) {
                    question.TimeLeft = question.TimeAllocated - selectedqus[0].TimeTaken;

                }
                question.QuestionOption.forEach(element => {
                    element.isSelectedOption = false;
                    element.IsCorrectAnswer = false;
                    let selectedopt = questionAnswerList.filter(item => item.questionId == question.Id && item.questionOptionId == element.Id)
                    if (selectedopt.length > 0) {
                        element.isSelectedOption = true
                    }
                });
            });
        }


        //isSelectedOption
        // const questionOptionRepository = getRepository(QuestionOption);
        // const questionOptionList = await questionOptionRepository.find({
        //     relations: ["Question"],
        //     // where: { quizId: quizId },
        //     where: { Question: { Id: quizId } },

        //     // select: ["Id", "Description", "QuestionType", "TimeAllocated", "TimeLeft", "SequenceNo" ]
        // });
        // const districtList = await getRepository(State)
        // .findOne(stateId, { relations: ["District"] });
        res.send(selectedquestionList);

    };
    static checkIfUserAnswered = async (req: Request, res: Response) => {
        // console.log(req)
        const currentuserid: string = req.params.currentuserId.toString();
        try {
            const UserSelectedAnswersRepo =  getRepository(UserSelectedAnswers);
            const getUser = await UserSelectedAnswersRepo.findOne({
                where: {
                    User : currentuserid
                }
            })
            if (getUser == undefined) {
                res.send(true)
            } else   {
                res.send(false)
            }
        } catch (error) {
            res.send('failed')
        }
       

    }
    static listAllQuestionAndResult = async (req: Request, res: Response) => {
        const currentuserid: string = req.params.currentuserId.toString();
        let selecteQusIdList = [];
        let selectedquestionList = [];
        const quizId: string = req.params.quizId;
        const questionRepository = getRepository(Question);
        const questionList = await questionRepository.find({
            relations: ["QuestionOption"],
            // where: { quizId: quizId },
            where: { Quiz: { Id: quizId } },

            select: ["Id", "Description", "QuestionType", "TimeAllocated", "TimeLeft", "SequenceNo", "WeightageType"]
        });

        const questionAnswerRepository = getRepository(QuestionAnswer);
        const questionAnswerList = await questionAnswerRepository.find({
            relations: ["Question", "QuestionOption"],
            where: { quizId: quizId, User: { Id: currentuserid } },
        });
        const userQuizMappingRepository = getRepository(UserQuizMapping);
        const userQuizMappingList = await userQuizMappingRepository.find({
            where: { quizId: quizId, userId: currentuserid },
            select: ["questionIdList"]

        });
        if (userQuizMappingList && userQuizMappingList.length > 0) {
            selecteQusIdList = userQuizMappingList[0].questionIdList.split(",");
        }
        questionList.forEach(question => {
            selecteQusIdList.forEach(element => {
                if (question.Id == element)
                    selectedquestionList.push(question);
            });
        });
        selectedquestionList.forEach((element, key) => {
            element.SequenceNo = key + 1;
        });
        selectedquestionList.forEach(question => {
            question.IsAnsweredCorrectly = false;
            let selectedqus = questionAnswerList.filter(item => item.Question.Id == question.Id)
            if (selectedqus.length > 0) {
                question.TimeLeft = question.TimeAllocated - selectedqus[0].TimeTaken;
                question.IsCompleteQuiz = selectedqus[0].IsCompleteQuiz;
            }
            question.QuestionOption.forEach(element => {
                element.isSelectedOption = false;

                let selectedopt = questionAnswerList.filter(item => item.questionId == question.Id && item.questionOptionId == element.Id)
                if (selectedopt.length > 0) {
                    element.isSelectedOption = true
                    if (element.IsCorrectAnswer)
                        question.IsAnsweredCorrectly = true;
                }
                element.IsCorrectAnswer = false;
            });
        });
        res.send(selectedquestionList);

    };
    static listLeadBoard = async (req: Request, res: Response) => {
        const quizId: string = req.params.quizId;
        const quizIdInt = parseInt(quizId);
        // const quizRepository = getRepository(Quiz);
        // const quizResult = await quizRepository.find({
        //     where: { StatusType: true },
        //     select: ["Id", "Title",]
        // });

        const districtRepository = getRepository(District);

        const districtList = await districtRepository.find({
            select: ["Id", "Name",]
        });

        const leadBoardRepository = getRepository(LeadBoardView);

        const leadBoardAllList = await leadBoardRepository.find();
        const leadBoardList = leadBoardAllList.filter(i => i.Id == 4 && i.UserId!=8033);
        const winnerRepository = getRepository(Winner);

        const winnerList = await winnerRepository.find();



        let result = { QuizNational: [], QuizStateWise: [], QuizDistrictWiseWinners: [], QuizDistrictWiseConsolation: [] };
        let quizNational = leadBoardList.filter(i => i.NationalLevel == 1);
        if (quizNational && quizNational.length > 0) {
            result.QuizNational.push(quizNational[0]);
        }
        // else if (quizNational && quizNational.length > 1) {
        //     let winnerUser = winnerList.filter(i => i.LevelType == 1);
        //     if (winnerUser && winnerUser.length > 0) {
        //         let resultQuizNational = quizNational.filter(i => i.UserId == winnerUser[0].UserId);
        //         if(resultQuizNational&&resultQuizNational.length>0){
        //             result.QuizNational.push(resultQuizNational[0]);
        //         }

        //     }
        // }




        result.QuizStateWise = [];
        let leadBoardListWithInState = leadBoardList.filter(i => i.StateId == 23);




        let FirstPrize = leadBoardListWithInState.filter(i => i.StateLevel == 1);
        if (FirstPrize && FirstPrize.length > 0) {
            FirstPrize.forEach(element => {
                element.IsStateFirst = true;
                result.QuizStateWise.push(element);
            });

        }
        // else if (FirstPrize && FirstPrize.length > 1) {
        //     let winnerUser = winnerList.filter(i => i.LevelType == 2 && i.PrizeType==1);
        //     if (winnerUser && winnerUser.length > 0) {
        //          let resultFirstPrize=FirstPrize.filter(i => i.UserId == winnerUser[0].UserId);
        //          if(resultFirstPrize&& resultFirstPrize.length>0){
        //             resultFirstPrize[0].IsStateFirst = true;
        //             result.QuizStateWise.push(resultFirstPrize[0]);
        //          }
        //     }
        // }


        let SecondPrize = leadBoardListWithInState.filter(i => i.StateLevel == 2);
        if (SecondPrize && SecondPrize.length > 0) {
            SecondPrize.forEach(element => {
                element.IsStateFirst = false;
                result.QuizStateWise.push(element);
            });


        }
        // else if (SecondPrize && SecondPrize.length > 1) {
        //     let winnerUser = winnerList.filter(i => i.LevelType == 2 && i.PrizeType==2);
        //     if (winnerUser && winnerUser.length > 0) {
        //         let resultSecondPrize = SecondPrize.filter(i => i.UserId == winnerUser[0].UserId);
        //         if(resultSecondPrize&&resultSecondPrize.length>0){
        //             resultSecondPrize[0].IsStateFirst = false;
        //             result.QuizStateWise.push(resultSecondPrize[0]); 
        //         }
        //     }
        // }




        districtList.forEach(element => {
            let districtData = { DistrictName: "", DistrictPrizeList: [] };
            let selectedFirst = leadBoardListWithInState.filter(i => i.DistrictLevel == 1 && i.DistrictName == element.Name);
            if (selectedFirst && selectedFirst.length > 0) {
                selectedFirst.forEach(selectedFirstelement => {
                    districtData.DistrictName = element.Name;
                    selectedFirstelement.IsDistrictFirst = true;
                    districtData.DistrictPrizeList.push(selectedFirstelement);
                });


            }
            // else if(selectedFirst && selectedFirst.length >1){
            //     districtData.DistrictName = element.Name;
            //     let winnerUser = winnerList.filter(i => i.LevelType == 3 && i.PrizeType==1);
            //     if (winnerUser && winnerUser.length > 0) {
            //         let resultselectedFirst = selectedFirst.filter(i => i.UserId == winnerUser[0].UserId);
            //         if(resultselectedFirst&&resultselectedFirst.length>0){
            //             resultselectedFirst[0].IsDistrictFirst = true;
            //             districtData.DistrictPrizeList.push(resultselectedFirst[0]); 
            //         }
            //     }
            // }






            let selectedSecond = leadBoardListWithInState.filter(i => i.DistrictLevel == 2 && i.DistrictName == element.Name);
            if (selectedSecond && selectedSecond.length > 0) {
                selectedSecond.forEach(selectedSecondelement => {
                    districtData.DistrictName = element.Name;
                    selectedSecondelement.IsDistrictFirst = false;
                    districtData.DistrictPrizeList.push(selectedSecondelement);
                });

            }

            // else if (selectedSecond && selectedSecond.length > 1) {
            //     districtData.DistrictName = element.Name;
            //     let winnerUser = winnerList.filter(i => i.LevelType == 3 && i.PrizeType == 2);
            //     if (winnerUser && winnerUser.length > 0) {
            //         let resultselectedSecond = selectedSecond.filter(i => i.UserId == winnerUser[0].UserId);
            //         if (resultselectedSecond && resultselectedSecond.length > 0) {
            //             resultselectedSecond[0].IsDistrictFirst = false;
            //             districtData.DistrictPrizeList.push(resultselectedSecond[0]);
            //         }
            //     }
            // }

            if (selectedFirst.length > 0 || selectedSecond.length > 0)
                result.QuizDistrictWiseWinners.push(districtData);
        });

        districtList.forEach(element => {
            let districtData = { DistrictName: "", DistrictPrizeList: [] };
            let selectedFirst = leadBoardListWithInState.filter(i => i.DistrictName == element.Name && i.ConsolationLevel == 1);
            if (selectedFirst && selectedFirst.length > 0) {
                //selectedFirst.splice(0, 1);
                let resultselectedFirst = [];
                selectedFirst.forEach(First => {
                    let winner = winnerList.filter(i => i.UserId == First.UserId);
                    if (winner && winner.length > 0) {

                    }
                    else {
                        resultselectedFirst.push(First);
                    }
                });
                districtData.DistrictName = element.Name;
                districtData.DistrictPrizeList = resultselectedFirst;
            }
            // let selectedSecond = leadBoardListWithInState.filter(i => i.DistrictLevel == 2 && i.DistrictName == element.Name);
            // if (selectedSecond && selectedSecond.length > 0) {
            //     //selectedSecond.splice(0, 1);
            //     districtData.DistrictName = element.Name;
            //     selectedSecond.forEach(selectedSecondData => {
            //         let winner = winnerList.filter(i => i.UserId == selectedSecondData.UserId);
            //         if (winner && winner.length > 0) {

            //         }
            //         else {
            //             districtData.DistrictPrizeList.push(selectedSecondData);
            //         }

            //     });


            // }
            if (selectedFirst.length > 0)
                result.QuizDistrictWiseConsolation.push(districtData);
        });

        // quizResult.forEach(element => {
        //     let quiz = leadBoardList.filter(i => i.Id == element.Id);
        //     result.push({ "Title": element.Title, "Result": quiz, "Id": element.Id })
        // });
        res.send(result);

    };
    static saveanswer = async (req: Request, res: Response) => {
        //Get parameters from the body
        const currentuserid: string = req.params.currentuserId.toString();
        const userRepository = getRepository(User);
        const currentuser = await userRepository.findOneOrFail(currentuserid);
        let { QuestionOptionsId, QuestionId, UserId, TimeTaken, IsCompleteQuiz, QuizId } = req.body;
        let rtn;
        const questionAnswerRepository = getRepository(QuestionAnswer);
        const questionAnswer = await questionAnswerRepository.findOne({
            where: {
                Question: { Id: QuestionId },
                // QuestionOption: { Id: QuestionOptionsId },
                User: { Id: UserId },
            },

        });

        if (questionAnswer && questionAnswer.Id > 0) {
            questionAnswer.QuestionOption = QuestionOptionsId;
            questionAnswer.TimeTaken = TimeTaken;
            const errors = await validate(questionAnswer);
            if (errors.length > 0) {
                rtn = {
                    IsSuccessfull: false,
                    Message: errors
                }
                res.send(rtn);
                return;
            }
            try {

                await questionAnswerRepository.save(questionAnswer);
            } catch (e) {
                rtn = {
                    IsSuccessfull: false,
                    Message: "unable to update details! try again later" + e
                }
                res.send(rtn);
                return;
            }
        }
        // else if (QuestionOptionsId !== null && QuizId !== null) {
        else if (QuizId !== null) {

            let newQuestionAnswer = new QuestionAnswer();
            try {
                // const questionOptionRepository = getRepository(QuestionOption);
                // const questionRepository = getRepository(Question);
                // const userRepository = getRepository(User);
                // newQuestionAnswer.QuestionOption = await questionOptionRepository.findOneOrFail(QuestionOptionsId);
                // newQuestionAnswer.Question = await questionRepository.findOneOrFail(QuestionId);
                // newQuestionAnswer.User = await userRepository.findOneOrFail(UserId);;

                newQuestionAnswer.Question = await getRepository(Question).findOne(QuestionId);
                if (QuestionOptionsId)
                    newQuestionAnswer.QuestionOption = await getRepository(QuestionOption).findOne(QuestionOptionsId);
                newQuestionAnswer.User = await getRepository(User).findOne(UserId);
                newQuestionAnswer.CreationUserId = currentuser.Firstname + " " + currentuser.Lastname;
                newQuestionAnswer.LastChangeUserId = currentuser.Firstname + " " + currentuser.Lastname;
                // newQuestionAnswer.questionOptionId = QuestionOptionsId;
                // newQuestionAnswer.questionId = QuestionId;
                newQuestionAnswer.TimeTaken = TimeTaken;
                // newQuestionAnswer.userId = UserId;
                newQuestionAnswer.quizId = QuizId;
                newQuestionAnswer.StatusType = true;
                newQuestionAnswer.IsCompleteQuiz = false;
                const errors = await validate(newQuestionAnswer);
                if (errors.length > 0) {
                    rtn = {
                        IsSuccessfull: false,
                        Message: errors
                    }
                    res.send(rtn);
                    return;
                }
                await questionAnswerRepository.save(newQuestionAnswer);
            } catch (e) {
                rtn = {
                    IsSuccessfull: false,
                    Message: "unable to update details! try again later" + e
                }
                res.send(rtn);
                return;
            }
        }
        if (IsCompleteQuiz) {
            const questionAnswer = await questionAnswerRepository.find({
                where: {
                    quizId: QuizId,
                    User: { Id: UserId },
                },

            });
            questionAnswer.forEach(element => {
                element.IsCompleteQuiz = true;
            });
            await questionAnswerRepository.save(questionAnswer);
        }
        rtn = {
            IsSuccessfull: true,
            Message: ""
        }
        //If all ok, send 201 response
        res.send(rtn);

    };
    static saveAllanswer = async (req: Request, res: Response) => {
        //Get parameters from the body
        let rtn;
        const currentuserid: string = req.params.currentuserId.toString();
        const userRepository = getRepository(User);
        const questionAnswerRepository = getRepository(QuestionAnswer);
        const currentuser = await userRepository.findOneOrFail(currentuserid);
        for (var i = 0; i < req.body.length; i++) {
            let { QuestionOptionsId, QuestionId, UserId, TimeTaken, IsCompleteQuiz, QuizId } = req.body[i];
            const questionAnswer = await questionAnswerRepository.findOne({
                where: {
                    Question: { Id: QuestionId },
                    // QuestionOption: { Id: QuestionOptionsId },
                    User: { Id: UserId },
                },

            });

            if (questionAnswer && questionAnswer.Id > 0) {
                questionAnswer.QuestionOption = QuestionOptionsId;
                questionAnswer.TimeTaken = TimeTaken;
                const errors = await validate(questionAnswer);
                if (errors.length > 0) {
                    rtn = {
                        IsSuccessfull: false,
                        Message: errors
                    }
                    res.send(rtn);
                    return;
                }
                try {

                    await questionAnswerRepository.save(questionAnswer);
                } catch (e) {
                    rtn = {
                        IsSuccessfull: false,
                        Message: "unable to update details! try again later" + e
                    }
                    res.send(rtn);
                    return;
                }
            }
            // else if (QuestionOptionsId !== null && QuizId !== null) {
            else if (QuizId !== null) {

                let newQuestionAnswer = new QuestionAnswer();
                try {
                    // const questionOptionRepository = getRepository(QuestionOption);
                    // const questionRepository = getRepository(Question);
                    // const userRepository = getRepository(User);
                    // newQuestionAnswer.QuestionOption = await questionOptionRepository.findOneOrFail(QuestionOptionsId);
                    // newQuestionAnswer.Question = await questionRepository.findOneOrFail(QuestionId);
                    // newQuestionAnswer.User = await userRepository.findOneOrFail(UserId);;

                    newQuestionAnswer.Question = await getRepository(Question).findOne(QuestionId);
                    if (QuestionOptionsId)
                        newQuestionAnswer.QuestionOption = await getRepository(QuestionOption).findOne(QuestionOptionsId);
                    newQuestionAnswer.User = await getRepository(User).findOne(UserId);
                    newQuestionAnswer.CreationUserId = currentuser.Firstname + " " + currentuser.Lastname;
                    newQuestionAnswer.LastChangeUserId = currentuser.Firstname + " " + currentuser.Lastname;
                    // newQuestionAnswer.questionOptionId = QuestionOptionsId;
                    // newQuestionAnswer.questionId = QuestionId;
                    newQuestionAnswer.TimeTaken = TimeTaken;
                    // newQuestionAnswer.userId = UserId;
                    newQuestionAnswer.quizId = QuizId;
                    newQuestionAnswer.StatusType = true;
                    newQuestionAnswer.IsCompleteQuiz = false;
                    const errors = await validate(newQuestionAnswer);
                    if (errors.length > 0) {
                        rtn = {
                            IsSuccessfull: false,
                            Message: errors
                        }
                        res.send(rtn);
                        return;
                    }
                    await questionAnswerRepository.save(newQuestionAnswer);
                } catch (e) {
                    rtn = {
                        IsSuccessfull: false,
                        Message: "unable to update details! try again later" + e
                    }
                    res.send(rtn);
                    return;
                }
            }
            if (IsCompleteQuiz) {
                const questionAnswer = await questionAnswerRepository.find({
                    where: {
                        quizId: QuizId,
                        User: { Id: UserId },
                    },

                });
                questionAnswer.forEach(element => {
                    element.IsCompleteQuiz = true;
                });
                await questionAnswerRepository.save(questionAnswer);
            }
        }
        rtn = {
            IsSuccessfull: true,
            Message: ""
        }
        //If all ok, send 201 response
        res.send(rtn);

    };


    static listAllSampleQuestion = async (req: Request, res: Response) => {


        let questionList = [];
        let selectedquestionList = [];
        const quizId = 1;
        const quizRepository = getRepository(Quiz);
        const quiz = await quizRepository.findOne({
            where: { Id: quizId },
            select: ["Id", "Title", "StartDate", "EndDate"] //We dont want to send the passwords on response
        });


        const questionRepository = getRepository(Question);
        let selecteQusIdList = [];

        questionList = await questionRepository.find({
            relations: ["QuestionOption"],
            // where: { quizId: quizId },
            where: { Quiz: { Id: quizId }, StatusType: true },

            select: ["Id", "Description", "QuestionType", "TimeAllocated", "TimeLeft", "SequenceNo", "WeightageType"]
        });
        questionList.forEach((element, key) => {
            element.SequenceNo = key + 1;
        });

        res.send(questionList);

    };

    static getdate = async (req: Request, res: Response) => {

        let dateview = { CurrentDate: new Date(new Date().toUTCString()), StartDate: new Date(), EndDate: new Date(), ResultDate: new Date() }
        const configRepository = getRepository(Config);

        const configList = await configRepository.find();
        if (configList && configList.length > 0) {
            dateview.StartDate = new Date(new Date(configList[0].Value).toUTCString());
        }
        if (configList && configList.length > 1) {
            dateview.EndDate = new Date(new Date(configList[1].Value).toUTCString());
        }
        if (configList && configList.length > 2) {
            dateview.ResultDate = new Date(new Date(configList[2].Value).toUTCString());
        }
        res.send(dateview);

    };
    static getCertificate = async (req: Request, res: Response) => {
        const userId: string = req.params.userId;
        let result = false;
        const leadBoardRepository = getRepository(LeadBoardView);

        let leadBoardAllList = await leadBoardRepository.find(
            {
                where: { UserId: userId }
            }
        );
        leadBoardAllList=leadBoardAllList.filter(s=>s.UserId!=8033);
        if (leadBoardAllList && leadBoardAllList.length > 0) {
            result = true;
        }
        res.send(result);

    };

    static getCertificateByteArray = async (req: Request, res: Response) => {
        const currentuserid: string = req.params.currentuserId.toString();
        const userRepository = getRepository(User);
        const currentuser = await userRepository.findOneOrFail(currentuserid);
        let filename = currentuser.Firstname + "_" + currentuser.Lastname + ".pdf";
        let filepath = "certificate/" + currentuser.Id + ".pdf"
        var fs = require('fs');
        let readStream = fs.createReadStream(filepath);
        let data = ''
        readStream.setEncoding('binary')
        readStream.once('error', err => {

            let rtn = {
                IsSuccessfull: false,
                Message: "Only Winners & Runners can download the certificate."
            }
            res.send(rtn)
        })
        readStream.on('data', chunk => (data += chunk))
        readStream.on('end', () => {
            let response = { value: data, key: filename };
            res.send(response)
        })

    };
    static saveUserSelectedAns = async (req: Request, res: Response) => {
        let rtn;
        let { AnswerString, DurationTakenInSeconds, userId, QuizId } = req.body;
        // const currentuserid  = Number(req.params.currentuserId);
        const answerAsStringRepository = getRepository(UserSelectedAnswers);
        let userAns = new UserSelectedAnswers()
        userAns.AnswerString = AnswerString;
        userAns.DurationTakenInSeconds = DurationTakenInSeconds;
        userAns.User = userId;
        userAns.quizId = 7;
        
        // const errors = await validate(req.body);
        try {
             await answerAsStringRepository.save(userAns);
             rtn = {
                IsSuccessfull: true,
                Message: "saved Result"
             }
            res.send(rtn)
        } catch(e){
            rtn = {
                IsSuccessfull: false,
                Message: "failed " + e
             }
            res.send(rtn)
        }

    }

};

export default QuizController;