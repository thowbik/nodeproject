import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";
import questionCache from "../cacheService/questionsCache.service";
const qstnCache = new questionCache();

class AuthController {
  static storeUserLoginInfoInCache = async () => {
    // const currentuserid: string = req.params.currentuserId.toString();
    const userRepository = getRepository(User);
    const questionSetList = await userRepository.find({
        select : ['Id','UserName', 'Email', 'MobileNumber','Password', 
        'Firstname', 'Lastname', 'IsNewPassword', 'RoleId', 'DistrictId',
        'StatusType' , 'UniversityId', 'CollegeId' ]
    });
    const getAllUsersDetails = questionSetList;
    qstnCache.storeByID( 'userLoginDetails', getAllUsersDetails );
    // const value = qstnCache.get( "myKey" );
  }

  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let rtn;
    let { username, password, param, loginType} = req.body;
    if (!(username && password)) {
      if (param) {
        rtn = {
          IsSuccessFull: false,
          Message: 'Invalid mobile number and password'
        }
      }
      else {
        rtn = {
          IsSuccessFull: false,
          Message: 'Invalid OTP'
        }
      }
      res.send(rtn);
    }

    //Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      try {
        if (loginType == 'officerLogin') {
         user = await userRepository.findOne({ UserName: username, StatusType: true });
         if (user == undefined) {
          user = await userRepository.findOne({ Email: username, StatusType: true });
         }
         if (user == undefined) {
          rtn = {
            IsSuccessFull: false,
            Message: 'Invalid Username / Email'
          }
          res.send(rtn);
          return;
         }
        } else {
         user = await userRepository.findOneOrFail({ MobileNumber: username, StatusType: true });
        }
            // iFuser is admin / Po should login using officerlogin pag
        if ( user.RoleId == 5 || user.RoleId == 2  ) {
          if (loginType != 'officerLogin') {
            rtn = {
              IsSuccessFull: false,
              Message: 'Approver should login using approver login page'
            }
            res.send(rtn);
            return;
          }
        }
        //Check if encrypted password match
        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
         
          if (param) {
            if (loginType == 'officerLogin') {
              rtn = {
                IsSuccessFull: false,
                Message: 'Invalid username and password'
              }
            } else {
              rtn = {
                IsSuccessFull: false,
                Message: 'Invalid mobile number and password'
              }
            }
           
          }
          else {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid OTP'
            }
          }
          res.send(rtn);
          return;
        }
        if (user.ApprovedRRCMember == false) {
          rtn = {
            IsSuccessFull: false,
            Message: 'User yet to be approved'
          }
          res.send(rtn);
          return;
        }
      }
      catch (error) {
        if (param) {
          if (loginType == 'officerLogin') {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid username and password'
            }
          } else {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid mobile number'
            }
          }
        }
        else {
          rtn = {
            IsSuccessFull: false,
            Message: 'Invalid OTP'
          }
        }
        
        res.send(rtn);
        return;
      }

      //Sing JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: user.Id, username: user.Firstname + " " + user.Lastname },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      let userInfo = {
        auth_token: token,
        userId: user.Id,
        isNewPassword: user.IsNewPassword,
        userName: user.Firstname + " " + user.Lastname,
        roleId: user.RoleId,
        districtId: user.DistrictId,
        universityId: user.UniversityId,
        collegeId: user.CollegeId
      };
      //Send the jwt in the response
      res.send(userInfo);
    }
    catch (error) {
      rtn = {
        IsSuccessFull: false,
        Message: 'Unable to login.Please try again later'
      }
      res.send(rtn);
    }
  };
  static loginFromCache = async (req: Request, res: Response) => {
    //Check if username and password are set
    let rtn;
    let { username, password, param, loginType} = req.body;
    if (!(username && password)) {
      if (param) {
        rtn = {
          IsSuccessFull: false,
          Message: 'Invalid mobile number and password'
        }
      }
      else {
        rtn = {
          IsSuccessFull: false,
          Message: 'Invalid OTP'
        }
      }
      res.send(rtn);
    }

    //Get user from database
    // const userRepository = getRepository(User);
    const userDetails = qstnCache.getStoredCacheByID('userLoginDetails');
    let user: User;
    try {
      try {
        if (loginType == 'officerLogin') {
        //  user = await userRepository.findOne({ UserName: username, StatusType: true });
          user = userDetails.find(e => e.UserName == username && e.StatusType == true )
         if (user == undefined) {
          // user = await userRepository.findOne({ Email: username, StatusType: true });
          user = userDetails.find(e => e.Email == username && e.StatusType == true )
         }
         if (user == undefined) {
          rtn = {
            IsSuccessFull: false,
            Message: 'Invalid Username / Email'
          }
          res.send(rtn);
          return;
         }
        } else {
        //  user = await userRepository.findOneOrFail({ MobileNumber: username, StatusType: true });
          user = userDetails.find(e => e.MobileNumber == username && e.StatusType == true )

        }
            // iFuser is admin / Po should login using officerlogin pag
        if ( user.RoleId == 5 || user.RoleId == 2  ) {
          if (loginType != 'officerLogin') {
            rtn = {
              IsSuccessFull: false,
              Message: 'Approver should login using approver login page'
            }
            res.send(rtn);
            return;
          }
        }
        //Check if encrypted password match
        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
         
          if (param) {
            if (loginType == 'officerLogin') {
              rtn = {
                IsSuccessFull: false,
                Message: 'Invalid username and password'
              }
            } else {
              rtn = {
                IsSuccessFull: false,
                Message: 'Invalid mobile number and password'
              }
            }
           
          }
          else {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid OTP'
            }
          }
          res.send(rtn);
          return;
        }
        if (user.ApprovedRRCMember == false) {
          rtn = {
            IsSuccessFull: false,
            Message: 'User yet to be approved'
          }
          res.send(rtn);
          return;
        }
      }
      catch (error) {
        if (param) {
          if (loginType == 'officerLogin') {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid username and password'
            }
          } else {
            rtn = {
              IsSuccessFull: false,
              Message: 'Invalid mobile number'
            }
          }
        }
        else {
          rtn = {
            IsSuccessFull: false,
            Message: 'Invalid OTP'
          }
        }
        
        res.send(rtn);
        return;
      }

      //Sing JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: user.Id, username: user.Firstname + " " + user.Lastname },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      let userInfo = {
        auth_token: token,
        userId: user.Id,
        isNewPassword: user.IsNewPassword,
        userName: user.Firstname + " " + user.Lastname,
        roleId: user.RoleId,
        districtId: user.DistrictId,
        universityId: user.UniversityId,
        collegeId: user.CollegeId
      };
      //Send the jwt in the response
      res.send(userInfo);
    }
    catch (error) {
      rtn = {
        IsSuccessFull: false,
        Message: 'Unable to login.Please try again later'
      }
      res.send(rtn);
    }
  };
  static changePasswordForRRC = async (req: Request, res: Response) => {
    const userDetails = qstnCache.getStoredCacheByID('userLoginDetails');
    // console.log(userDetails)
    const userRepository = getRepository(User);
    let { Id, Password, OldPassword } = req.body;
    let rtn;
    try {
      const user = await userRepository.findOne({
        where: { Id: Id },
      });
      if (user) {
        if (OldPassword) {
          if (!user.checkIfUnencryptedPasswordIsValid(OldPassword)) {
            rtn = {
              IsSuccessfull: false,
              Message: "Old password not match"
            }
            res.send(rtn);
            return;
          }
        }
        user.Password = Password;
        user.IsNewPassword = false;
        user.PasswordRaw = Password;
        const errors = await validate(user);
        if (errors.length > 0) {
          rtn = {
            IsSuccessfull: false,
            Message: errors
          }
          res.send(rtn);
          return;
        }

        //Hash the password, to securely store on DB
        user.hashPassword();

        //Try to save. If fails, the username is already in use
        const userRepository = getRepository(User);
       

        try {
          await userRepository.save(user);
            // get user details cache and delete
            // const userLoginCache = qstnCache.getStoredUserInfoByID('userLoginDetails');
            // remove user who changed the password
            const userChangedPassIdx = userDetails.findIndex(e => e.Id == user.Id );
            const userChangedPass = await userRepository.findOneOrFail({
              where: { Id: Id }
            });
            userDetails[userChangedPassIdx] = userChangedPass
            // Save array  
            qstnCache.storeByID('userLoginDetails', userDetails)
        } catch (e) {
          rtn = {
            IsSuccessfull: false,
            Message: "User already in use"
          }
          res.send(rtn);
          return;
        } rtn = {
          IsSuccessfull: true,
          Message: "Password changed successfully"
        }

      }
      res.send(rtn);
    }
    catch (error) {
      res.status(404).send("User not found" + error);
    }
  };
  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    //Validate de model (password lenght)
    user.Password = newPassword;
    user.PasswordRaw = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };
}
export default AuthController;