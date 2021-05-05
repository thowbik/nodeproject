import { Request, Response } from "express";
import { getRepository, MoreThan } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
import { College } from "../entity/College";
import { District } from "../entity/District";
import { NotificationMessageInfo } from "../entity/NotificationMessageInfo";
import { EmailAccounts } from "../entity/EmailAccounts";
import questionCache from "../cacheService/questionsCache.service";
import { getManager } from 'typeorm';

const qstnCache = new questionCache();

var nodemailer = require('nodemailer');

 class UserController {

  static listAll = async (req: Request, res: Response) => {
    const currentuserid: string = req.params.currentuserId.toString();

    //Get users from database
    const userRepository = getRepository(User);

    const currentuser = await userRepository.findOneOrFail(currentuserid);

    const allusers = await userRepository.find({
      select: ["Id", "Firstname", "Lastname", "MobileNumber", "Email", "StatusType", "RoleId", "DistrictId", "StateId"] //We dont want to send the passwords on response
    });

    var users = allusers;
    if (currentuser.RoleId != 1) {
      users = allusers.filter(item => item.RoleId != 1);
    }

    const DistrictRepository = getRepository(District);
    for (var i = 0; i < users.length; i++) {
      // if (users[i].DistrictId > 0) {
      //   users[i].Districtname = (await DistrictRepository.findOneOrFail(users[i].DistrictId)).Name;
      // }
      // else {
      //   users[i].Districtname = "";
      // }
      users[i].setrolename();
    }
    //Send the users object
    res.send(users);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: string = req.params.id;

    //Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, {
        select: ["Id", "Firstname", "Lastname", "MobileNumber", "Email", "StatusType", "RoleId", "DistrictId", "StateId"] //We dont want to send the passwords on response
      });

      const DistrictRepository = getRepository(District);
      // if (user.DistrictId > 0) {
      //   user.Districtname = (await DistrictRepository.findOneOrFail(user.DistrictId)).Name;
      // }
      // else {
      //   user.Districtname = "";
      // }

      user.setrolename();
      res.send(user);
    } catch (error) {
      res.status(404).send("User not found" + error);
    }
  };

  static usermenu = async (req: Request, res: Response) => {

    const currentuserid: string = req.params.currentuserId.toString();

    //Get users from database
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(currentuserid);
    let data;
    const fs = require('fs');
    try { data = fs.readFileSync('menu.json'); }
    catch (error) { }
    let usermenu = JSON.parse(data);

    for (var i = 0; i < usermenu.length; i++) {
      var menudr = usermenu[i];
      if (menudr["RoleId"] == user.RoleId) {
        var rtn = {
          IsSuccessfull: true,
          menuinfo: menudr["menus"]
        }
      }
    }
    //Send the users object
    res.send(rtn);
  };

  static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body
    // const currentuserid: string = req.params.currentuserId.toString();
    // const userRepository = getRepository(User);
    // const currentuser = await userRepository.findOneOrFail(currentuserid);
    let { Id, Password, Firstname, Lastname, Email, MobileNumber, StatusType, RoleId, DistrictId, StateId, 
      CityTown, IsDonatedBlood, IsStudent, ClubType, AadhaarNo,
      MemberOfRRC, UniversityName, CollegeName, StudentRegNo, AcademicYear, YearStudying, registerType,
      Designation } = req.body;
    let rtn;
    //const userRepository = getRepository(User);
     if (Id == 0) {
      // let userAadhaar = await userRepository.findOne({
      //   where: { AadhaarNo: AadhaarNo }
      // });
      // let userMobileNumber = await userRepository.findOne({
      //   where: { MobileNumber: MobileNumber }
      // });
      // if(userAadhaar && userMobileNumber){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Aadhaar number & Mobile number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      // if(userAadhaar){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Aadhaar number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      // if(userMobileNumber){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Mobile number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      let user = new User();
      user.Password = Password;
      user.Firstname = Firstname;
      user.AadhaarNo = AadhaarNo;
      user.IsNewPassword = false;
      user.Lastname = Lastname;
      user.Email = Email;
      user.StateId = StateId;
      user.CityTown = CityTown;
      user.IsStudent = IsStudent;
      user.IsDonatedBlood = IsDonatedBlood;
      user.ClubType = ClubType;
      user.MobileNumber = MobileNumber;
      user.StatusType = StatusType
      user.CreationUserId = "Admin";
      user.LastChangeUserId = "Admin";
      user.RoleId = RoleId;
      user.DistrictId = DistrictId;
      user.MemberOfRRC = MemberOfRRC, user.UniversityId = UniversityName, 
      user.YearOfStudying = YearStudying, 
      user.CollegeId = CollegeName, user.StudentRegNo = StudentRegNo, 
      user.AcademicYear = AcademicYear, user.ApprovedRRCMember = false
      user.ApprovalUserId = ''; user.ApprovalTs = null; user.UserName='';
      user.PODesignation = Designation;
      if (registerType == 'poRegister') {
        user.RoleId = 5
      }


      //Validade if the parameters are ok
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
      } catch (e) {
        rtn = {
          IsSuccessfull: false,
          Message: "Username already in use"
        }
        res.send(rtn);
        return;
      }

      rtn = {
        IsSuccessfull: true,
        Message: "User created Successfully"
      }
      UserController.sendEmail(user, 'newUser');
      //If all ok, send 201 response
      res.send(rtn);
    }
    else {
      const userRepository = getRepository(User);
      let user;
      try {
        user = await userRepository.findOne({
          where : {MobileNumber : MobileNumber}
        });
      } catch (error) {
        rtn = {
          IsSuccessfull: false,
          Message: "User not found"
        }
        //If not found, send a 404 response
        res.send(rtn);
        return;
      }
      // let userAadhaar = await userRepository.findOne({
      //   where: { AadhaarNo: AadhaarNo }
      // });
      // let userMobileNumber = await userRepository.findOne({
      //   where: { MobileNumber: MobileNumber }
      // });
      // if(userAadhaar && userMobileNumber){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Aadhaar number & Mobile number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      // if(userAadhaar){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Aadhaar number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      // if(userMobileNumber){
      //   rtn = {
      //     IsSuccessfull: false,
      //     Message: "Mobile number has been registered already"
      //   }
      //   res.send(rtn);
      //   return;
      // }
      //Validate the new values on model

      if (Id > 0) {
        user.Email = Email;
        // user.MobileNumber = MobileNumber
      } else {
        if (user == undefined) {
          user  = new User()
        }
        user.Firstname = Firstname;
        user.Lastname = Lastname;
        user.AadhaarNo = AadhaarNo;
        // user.IsNewPassword = true;
        //For RRC QUIZ
        user.IsNewPassword = false;
        user.Email = Email;
        user.MobileNumber = MobileNumber;
        user.StatusType = StatusType;
        user.RoleId = RoleId;
        user.StateId = StateId;
        user.CityTown = CityTown;
        user.IsStudent = IsStudent;
        user.IsDonatedBlood = IsDonatedBlood;
        user.ClubType = ClubType;
        user.Password = Password;
        user.PasswordRaw = Password;
        user.DistrictId = DistrictId;
        user.CreationUserId = "Guest";
        user.LastChangeUserId = "Guest";
        user.MemberOfRRC = MemberOfRRC;   user.UniversityId = UniversityName;
        user.CollegeId = CollegeName;     user.StudentRegNo = StudentRegNo;
        user.AcademicYear = AcademicYear; user.ApprovedRRCMember = false;
        user.YearOfStudying = YearStudying;
        user.ApprovalUserId = ''; user.ApprovalTs = null; user.UserName='';
        user.PODesignation = Designation;
        if (registerType == 'poRegister') {
          user.RoleId = 5
        }
      }
      const errors = await validate(user);
      if (errors.length > 0) {
        res.send(errors);
        return;
      }
      //Hash the password, to securely store on DB
      if (Id > 0 == false) {
        user.hashPassword();
        // user.Email = Email;
        // user.MobileNumber = MobileNumber
      }
      
      //Try to safe, if fails, that means username already in use
      try {

        await userRepository.save(user);
      } catch (e) {
        if (e.toString().indexOf("Duplicate") != -1) {
          rtn = {
            IsSuccessfull: false,
            Message: "Email Id has been registered already"

          }          
        }
        else {
          console.log(e)
          rtn = {
            IsSuccessfull: false,
            Message: "unable to update user details! try again later"

          }
        }
        res.send(rtn);
        return;
      }

      rtn = {
        IsSuccessfull: true,
        Message: "User updated successfully"
      }
      UserController.sendEmail(user, 'newUser');

      //After all send a 204 (no content, but accepted) response
      res.send(rtn);
    }
  };
  
  static async sendEmail(user, type) {
    let rtn  = {}
    var text = ''; var mailSubject = ''
    if (type == 'newUser' && user.RoleId == 5) {
      mailSubject = 'RRC PO Registered Successfully'
      text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
      <p>Your  Red Ribbon Club Program Officer registration has been submitted to your University Co-ordinator. 
      We will update you once your registration is approved.</p> 
      <p> Kind attention to RRC PO's <br>
      Those who have registered in the quiz-tansacs programme should get the approval from RRC Co-Ordinator. 
      Only then you can approve your students to participate even if they have registered.</p>
      <p> Regards, <br>Admin TNSACS </p> <span> *This is an auto generated mail. Please do not reply to this mail* </span>`
      
    } else if (type == 'newUser' && user.RoleId == 3) {
      mailSubject = 'RRC Quiz Registered Successfully'
      text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
      <p> You have successfully registered for TNSACS RRC Quiz.<br> 
      <p>Your registration has been submitted to your College RRC Program Officer. 
      We will update you once your registration is approved.</p> 
      <p> Regards, <br>Admin TNSACS </p> <span> *This is an auto generated mail. Please do not reply to this mail* </span>`
      
    } 
    else if (type == 'approved' && user.RoleId == 5 ) {
      mailSubject = 'RRC PO Registration Approved for TNSACS RRC Quiz'
      text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
      <p> Your Red Ribbon Club Program Officer registration for RRC Quiz has been approved by your University Co-Ordinator.<br> 
      <p>Quiz starts by 10 AM on 30th Dec 2020 </p> 
      <p> Regards, <br>Admin TNSACS </p> <span> *This is an auto generated mail. Please do not reply to this mail* </span>`
      
    }
     else if (type == 'approved' && user.RoleId == 3 ) {
      mailSubject = 'Registration Approved for TNSACS RRC Quiz'
      text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
      <p> Your Red Ribbon Club Quiz registration has been approved by RRC Program Officer. You could be the one to win cash rewards, be ready. <br> 
      <p>Quiz starts by 10 AM on 30th Dec 2020. Stay Tuned!  </p>
      <p> Regards, <br>Admin TNSACS </p> <span> *This is an auto generated mail. Please do not reply to this mail* </span>`  
    }

    const EmailRepo = getRepository(EmailAccounts);
    const randomNumber = Math.floor((Math.random() * 10) + 1);
    const getEmailAccount = await EmailRepo.findOneOrFail(randomNumber);

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: getEmailAccount.EmailId,
            pass: getEmailAccount.EmailPassword
          }
        });
        var mailOptions = {
          from:  'donotreply@tnsacs.in',
          to: user.Email,
          subject: mailSubject,
          html: text
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(getEmailAccount.EmailId + ' ' + error);
            const notificationRepo = getRepository(NotificationMessageInfo)
            let notification = new NotificationMessageInfo();
            notification.ExceptionMessage = error.message;
            notification.Message = '';
            notification.MessageStatusType = 4;
            notification.NotificationType = 2;
            notification.NoOfRetries = 3; notification.NoOfAttempts = 1;
            notification.Recipient = user.Email;
            notification.StatusType = true;
            notification.CreationUserId = 'System';
            notification.LastChangeUserId = 'System';
            notification.Subject = '';
            notificationRepo.save(notification)
            rtn = {
              IsSuccessfull: false,
              Message: "Please try again"
            }
          } else {
            console.log('Email sent: ' + info.response);
            const notificationRepo = getRepository(NotificationMessageInfo)
            let notification = new NotificationMessageInfo();
            notification.ExceptionMessage = '';
            notification.Message = text;
            notification.MessageStatusType = 3;
            notification.NotificationType = 2;
            notification.NoOfRetries = 3;notification.NoOfAttempts = 1;
            notification.Recipient = user.Email;
            notification.StatusType = true;
            notification.CreationUserId = 'System';
            notification.LastChangeUserId = 'System';
            notification.Subject = mailOptions.subject;
            notificationRepo.save(notification)

            rtn = {
              IsSuccessfull: true,
              Message: "Mail Sent"
            }
          }
        });

  }
  static editUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    const { username, role } = req.body;

    //Try to find user on database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("User not found");
      return;
    }

    //Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means username already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("username already in use");
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    userRepository.delete(id);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };


  static getOtp = async (req: Request, res: Response) => {
    let rtn;
    //Get the mobileNumber from the url
    const mobileNumber: string = "+" + req.params.mobileNumber;

    //Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne({
        where: { MobileNumber: mobileNumber },
        // select: ["Id", "MobileNumber", "RoleId"]
      });
      if (user) {
        if (user.RoleId == 4) {
          //send otp
          let random = (Math.floor(100000 + Math.random() * 900000)).toString();
          user.Password = random;
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
          } catch (e) {
            rtn = {
              IsSuccessfull: false,
              Message: "User already in use"
            }
            res.send(rtn);
            return;
          }
          let otpstatus = await UserController.sendOtp(user.MobileNumber, random, false);
          if (otpstatus) {
            rtn = {
              IsSuccessfull: true,
              Message: " OTP has been sent to your  mobile number"
            }
          }
          else {
            rtn = {
              IsSuccessfull: false,
              Message: "Please try again"
            }
          }
        }
        else {
          rtn = {
            IsSuccessfull: false,
            Message: "User already registered"
          }
        }
      }
      else {
        //create user
        let random = (Math.floor(100000 + Math.random() * 900000)).toString();
        let newuser = new User();
        newuser.Password = random;
        newuser.Lastname = "Guest";
        newuser.Firstname = "Guest";
        newuser.AadhaarNo = parseInt(mobileNumber.replace("+91", ""));
        newuser.IsNewPassword = false;
        newuser.Email = "";
        newuser.RoleId = 4;
        newuser.DistrictId = 0;
        newuser.StateId = 0;
        newuser.CityTown = "";
        newuser.IsStudent = false;
        newuser.IsDonatedBlood = false;
        newuser.ClubType = 0;
        newuser.MobileNumber = mobileNumber;
        newuser.StatusType = true;
        newuser.CreationUserId = "Guest";
        newuser.LastChangeUserId = "Guest";

        //Validade if the parameters are ok
        const errors = await validate(newuser);
        if (errors.length > 0) {
          rtn = {
            IsSuccessfull: false,
            Message: errors
          }
          res.send(rtn);
          return;
        }

        //Hash the password, to securely store on DB
        newuser.hashPassword();

        //Try to save. If fails, the username is already in use
        const userRepository = getRepository(User);
        try {
          await userRepository.save(newuser);
        }
        catch (e) {
          rtn = {
            IsSuccessfull: false,
            Message: "User already in use"
          }
          res.send(rtn);
          return;
        }
        //send otp

        let otpstatus = await UserController.sendOtp(newuser.MobileNumber, random, false);
        if (otpstatus) {
          rtn = {
            IsSuccessfull: true,
            Message: " OTP has been sent to your Email ID"
          }
        }
        else {
          rtn = {
            IsSuccessfull: false,
            Message: "Please try again"
          }
        }
      }

      res.send(rtn);
    }
    catch (error) {
      res.status(404).send("User not found" + error);
    }
  };
  static getForgotPassword = async (req: Request, res: Response) => {
    let rtn;
    //Get the mobileNumber from the url
    const mobileNumber: string = "+" + req.params.mobileNumber;

    //Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail({
        where: { MobileNumber: mobileNumber },
      });
      if (user) {

        //send otp
        let random = (Math.floor(100000 + Math.random() * 900000)).toString();
        user.Password = random;
        user.IsNewPassword = true;
        user.PasswordRaw = random;
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
        } catch (e) {
          rtn = {
            IsSuccessfull: false,
            Message: "User already in use"
          }
          res.send(rtn);
          return;
        }
        let otpstatus = await UserController.sendOtp(user.MobileNumber, random, true);
        var text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
        <p> We have received a request to reset the login password. <br> 
        MobileNumber:  ${user.MobileNumber} <br> New login Password : ${random} <p> 
        <p> Regards, <br>Admin, <br> TNSACS <p>`


        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'tnsacs.rrc5@gmail.com',
            pass: 'quiz@rrc5'
          }
        });
        var mailOptions = {
          from: 'tnsacs.rrc5@gmail.com',
          to: user.Email,
          subject: 'Reset RRC Quiz Login Password',
          html: text
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
            rtn = {
              IsSuccessfull: false,
              Message: "Please try again"
            }
          } else {
            console.log('Email sent: ' + info.response);
            rtn = {
              IsSuccessfull: true,
              Message: "New password sent successfully to your registered Email Id"
            }
          }
          });
          if (otpstatus) {
            
          }
          else {
            
          }
          rtn = {
            IsSuccessfull: true,
            Message: "New password sent successfully to your registered Email Id"
          }
      }
      res.send(rtn);
    }
    catch (error) {
      rtn = {
        IsSuccessfull: false,
        Message: "User not found with given Mobile Number" 
      }
      res.send(rtn);
    }
  };
  static sendPasswordOnForgotPassword = async (req: Request, res: Response) => {
    let rtn;
    //Get the mobileNumber from the url
    const mobileNumber: string = "+" + req.params.mobileNumber;

    //Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail({
        where: { MobileNumber: mobileNumber },
      });
      if (user) {
        //Try to save. If fails, the username is already in use
        try {
          var Userpassword = user.PasswordRaw;
         
        } catch (e) {
          rtn = {
            IsSuccessfull: false,
            Message: "User already in use"
          }
          res.send(rtn);
          return;
        }
        // let otpstatus = await UserController.sendOtp(user.MobileNumber, password, true);
        var text = `<p>Dear ${user.Firstname}  ${user.Lastname}, </p>
        <p> We have received your request that you have lost your login password. <br> 
        Mobile Number:  ${user.MobileNumber} <br> New login Password : ${Userpassword} <p> 
        <p> Regards, <br>Admin, <br> TNSACS <p>`

      const randomNumber = Math.floor((Math.random() * 10) + 1);
      var mailId, mailPass = '';
      if (randomNumber / 2 == 0) {
        mailId = 'tnsacs.rrc11@gmail.com';
        mailPass = 'quiz@111'
      } else {
        mailId = 'tnsacs.rrc12@gmail.com';
        mailPass = 'quiz@112'
      }

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: mailId,
            pass: mailPass
          }
        });
        var mailOptions = {
          from: 'tnsacs.rrc5@gmail.com',
          to: user.Email,
          subject: 'RRC Quiz Login Password',
          html: text
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
            rtn = {
              IsSuccessfull: false,
              Message: "Please try again"
            }
          } else {
            console.log('Email sent: ' + info.response);
            rtn = {
              IsSuccessfull: true,
              Message: "New password sent successfully to your registered Email Id"
            }
          }
          });
          rtn = {
            IsSuccessfull: true,
            Message: "New password sent successfully to your registered Email Id"
          }
      }
      res.send(rtn);
    }
    catch (error) {
      rtn = {
        IsSuccessfull: false,
        Message: "User not found with given Mobile Number" 
      }
      res.send(rtn);
    }
  };
  static changePassword = async (req: Request, res: Response) => {
    console.log(userDetails)
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
        var userDetails = qstnCache.getStoredCacheByID('qstnsets');
       
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
  // static sendOtp = async (mobileNumber: string, otp: string) => {
  //   const https = require('https');
  //   let number = mobileNumber.replace("+91", "");
  //   let msg = "Your OTP for TN Quiz is " + otp + ".";
  //   return await https.get('https://api.cutesms24.com/sms.aspx?email=yuvarajesh.r@xenovex.com&pw=sms@2017&sid=XENCNT&msg=' + msg + '&to=' + number, (resp) => {
  //     let data = '';

  //     // A chunk of data has been recieved.
  //     resp.on('data', (chunk) => {
  //       data += chunk;
  //     });

  //     // The whole response has been received. Print out the result.
  //     resp.on('end', () => {
  //       if (data.indexOf("SMS SENT") != -1) {
  //         return true;
  //       }
  //     });

  //   }).on("error", (err) => {
  //     console.log("Error: " + err.message);
  //     return false;
  //   });
  // };

  static sendOtp = async (mobileNumber: string, otp: string, isForgotPassword: boolean) => {
    let msg;
    let number = mobileNumber.replace("+91", "");
    if (isForgotPassword)
      msg = "Your new password for TN Quiz is " + otp + ".";
    else
      msg = "Your OTP for TN Quiz is " + otp + ".";
    //return await WebRequest.get('https://api.cutesms24.com/sms.aspx?email=yuvarajesh.r@xenovex.com&pw=sms@2017&sid=XENCNT&msg=' + msg + '&to=' + number);


    let notificationMessageInfo = new NotificationMessageInfo();
    notificationMessageInfo.CreationUserId = "System";
    notificationMessageInfo.LastChangeUserId = "System";
    notificationMessageInfo.Recipient = number;
    notificationMessageInfo.NoOfAttempts = 0;
    notificationMessageInfo.NoOfRetries = 3;
    notificationMessageInfo.Message = msg;
    notificationMessageInfo.Subject = "";
    notificationMessageInfo.ExceptionMessage = "";
    notificationMessageInfo.NotificationType = 1;//sms
    notificationMessageInfo.MessageStatusType = 1;//new
    notificationMessageInfo.StatusType = true;

    const errors = await validate(notificationMessageInfo);
    if (errors.length > 0) {
      return false;
    }
    const notificationMessageInfoRepository = getRepository(NotificationMessageInfo);
    try {
      await notificationMessageInfoRepository.save(notificationMessageInfo);
    }
    catch (e) {
      console.log(e)
      return false;
    }
    return true;
  };
  static getStudentListForCollege = async (req : Request, res : Response) => {
    try {
      const approverId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const approver = await userRepo.findOneOrFail(approverId);
      let listToAppove =  await userRepo.find({where : {
        CollegeId : approver.CollegeId,
        RoleId: 3
        // ApprovedRRCMember : false
      }});
      const collegeList = await getRepository(College).find();
      listToAppove.forEach(e => {
        let filteredClg = collegeList.filter(elem => elem.Id == e.CollegeId);
        // console.log(filterArray);
        e['CollegeName'] = filteredClg[0].Name;
        delete e['Password'];delete e['PasswordRaw'];
      })
      res.send(listToAppove)
    } catch (error) {
      res.send(error)
    }
  };

  static getCollegeListForUniv = async (req : Request, res : Response) => {
    try {
      const approverId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const approver = await userRepo.findOneOrFail(approverId);
      let allListForUniv =  await userRepo.find({where : {
        UniversityId : approver.UniversityId,
        RoleId: 5
        // ApprovedRRCMember : false
      }});
      const collegeList = await getRepository(College).find({where : {
        University : {Id : approver.UniversityId}
      }});
      allListForUniv.forEach(e => {
        let filteredClg = collegeList.filter(elem => elem.Id == e.CollegeId);
        // console.log(filterArray);
        e['CollegeName'] = filteredClg[0].Name;
        delete e['Password'];delete e['PasswordRaw'];
      })
      res.send(allListForUniv)
    } catch (error) {
      res.send(error)
    }
  };
  //Notin use
  static getApprovedMemberList = async (req : Request, res : Response) => {
    try {
      const approverId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const approver = await userRepo.findOneOrFail(approverId);
      let listToAppove =  await userRepo.find({where : {
        UniversityId : approver.UniversityId,
        ApprovedRRCMember : true
      }});
      const collegeList = await getRepository(College).find();
      listToAppove.forEach(e => {
        let filteredClg = collegeList.filter(elem => elem.Id == e.CollegeId);
        // console.log(filterArray);
        e['CollegeName'] = filteredClg[0].Name;
        delete e['Password'];delete e['PasswordRaw'];
      });
      res.send(listToAppove)
    } catch (error) {
      res.send(error)
    }
  }
  static getUser = async (req : Request, res : Response) => {
    try {
      const userId = Number(req.params.userId);
      const userRepo = await getRepository(User);
      let user =  await userRepo.findOneOrFail({where : {
        Id : userId
      }});
      // console.log(user)
      const collegeList = await getRepository(College).find({
        where : {Id : user.CollegeId}
      });
        user['CollegeName'] = collegeList[0].Name;
        user['Designation'] = user.PODesignation;
        delete user.PODesignation;
      res.send(user)
    } catch (error) {
      res.send(error)
    }
  }
  static approveOne = async (req : Request, res : Response) => { 
    var rtn = {} 
    try {
      const userId = Number(req.body.Id);
      const approverUserId = req.body.approverUserId;
      const userRepo = await getRepository(User);
      let user =  await userRepo.findOneOrFail({where : {
        Id : userId
      }});
      user.ApprovedRRCMember = true;
      user.ApprovalUserId = approverUserId;
      user.ApprovalTs = new Date(); 
      await userRepo.save(user);
      UserController.sendEmail(user, 'approved')
      rtn = {
        IsSuccessfull : true,
        Message : 'Approved ' +  user.Firstname
      }
    } catch (error) {
      rtn = {
        IsSuccessfull : false,
        Message : 'Failed ' +  console.error()
        
      }
      res.send(rtn)
    }
    res.send(rtn)
  }

  static getRegCountsPerUniversity = async (req : Request, res : Response) => { 
    let rtn = {}
    try {
      const approverId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const approver = await userRepo.findOneOrFail(approverId);
      const allRegUsersInUniversity =  await userRepo.count({where : {
        UniversityId : approver.UniversityId,
        RoleId : 5
      }});
      const approvedUsersInUniversity =  await userRepo.count({where : {
        UniversityId : approver.UniversityId,
        ApprovedRRCMember : true,
        RoleId : 5
      }});
      const notApprovedInUniversity =  await userRepo.count({where : {
        UniversityId : approver.UniversityId,
        ApprovedRRCMember : false,
        RoleId : 5
      }});
      rtn = {
        totalRegistrationcount : allRegUsersInUniversity,
        totalApprovedcount : approvedUsersInUniversity,
        registrationtobeApproved : notApprovedInUniversity
      }
      res.send(rtn)
    } catch(e){
      res.send(e);
    }
  }

  static getRegCountsPerCollege = async (req : Request, res : Response) => {
    let rtn = {}
    try {
      const collegePOId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const collegePO = await userRepo.findOneOrFail(collegePOId);
      const allRegUsersInUniversity =  await userRepo.count({where : {
        CollegeId : collegePO.CollegeId,
        RoleId : 3
      }});
      const approvedUsersInUniversity =  await userRepo.count({where : {
        CollegeId : collegePO.CollegeId,
        RoleId : 3,
        ApprovedRRCMember : true
      }});
      const notApprovedInUniversity =  await userRepo.count({where : {
        CollegeId : collegePO.CollegeId,
        ApprovedRRCMember : false,
        RoleId : 3
      }});
      rtn = {
        totalRegistrationcount : allRegUsersInUniversity,
        totalApprovedcount : approvedUsersInUniversity,
        registrationtobeApproved : notApprovedInUniversity
      }
      res.send(rtn)
    } catch(e){
      res.send(e);
    }
  }
  static getParticipantsCount = async (req : Request, res : Response) => {
    
    const entityManager = getManager();
    let rtn = {}
    try {
      const currentuserId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const currentUser = await userRepo.findOneOrFail(currentuserId);
      if (currentUser.RoleId == 5) {
        const allRegUsersInUniversity =  await userRepo.count({where : {
          CollegeId : currentUser.CollegeId,
          RoleId : 3
        }});
        const approvedUsersInUniversity =  await userRepo.count({where : {
          CollegeId : currentUser.CollegeId,
          RoleId : 3,
          ApprovedRRCMember : true
        }});
      /*   const participatedCount =  await userRepo.find( {  where : {
          CollegeId : currentUser.CollegeId,
          ApprovedRRCMember : false,
          RoleId : 3
        }});
         */
      const participateCount = entityManager.query(`Select count(*) from
       user where id in (select userId from quiz_dec10.user_selected_answers) 
       and  CollegeId = ${currentUser.CollegeId}`);

       const notApprovedInUniversity =  await userRepo.count({where : {
        CollegeId : currentUser.CollegeId,
        ApprovedRRCMember : false,
        RoleId : 3
      }});
      const
      rtn = {
        totalRegistrationcount : allRegUsersInUniversity,
        totalApprovedcount : approvedUsersInUniversity,
        registrationtobeApproved : notApprovedInUniversity,
        participateCount : participateCount

      }
        res.send(rtn)
      } else   if (currentUser.RoleId == 2) {
        const allRegUsersInUniversity =  await userRepo.count({where : {
          UniversityId : currentUser.UniversityId,
          RoleId : 3
        }});
        const approvedUsersInUniversity =  await userRepo.count({where : {
          UniversityId : currentUser.UniversityId,
          RoleId : 3,
          ApprovedRRCMember : true
        }});
        const notApprovedInUniversity =  await userRepo.count({where : {
          CollegeId : currentUser.CollegeId,
          ApprovedRRCMember : false,
          RoleId : 3
        }});
        const participateCount = entityManager.query(`Select count(*) from
       user where id in (select userId from quiz_dec10.user_selected_answers) 
       and  UniversityId = ${currentUser.UniversityId} `)
       const 
      rtn = {
        totalRegistrationcount : allRegUsersInUniversity,
        totalApprovedcount : approvedUsersInUniversity,
        registrationtobeApproved : notApprovedInUniversity,
        participateCount : participateCount

      }
       res.send(rtn)
      }
     
    } catch(e){
      res.send(e);
    }
  }
  
  static getCollegeWiseCountsPerUniversity = async (req : Request, res : Response) => { 
    let rtn = {}
    try {
      const approverId = Number(req.query.userId);
      const userRepo = await getRepository(User);
      const approver = await userRepo.findOneOrFail(approverId);
      const collegeList = await getRepository(College).find({
        University : {Id : approver.UniversityId}
      });
      // const collegeList = await getRepository(College).find();
      let countsCollegeWise =   await userRepo.createQueryBuilder('user')
                                .where({Id: MoreThan(9089), UniversityId : approver.UniversityId, })
                                 .select("Count(*)","countPerCollege")
                                 .addSelect("CollegeId")
                                 .groupBy('CollegeId')
                                 .orderBy('count(*)', 'DESC')
                                 .getRawMany()
      // console.log(countsCollegeWise);
    
      countsCollegeWise.forEach(e => {
        let filteredClg = collegeList.filter(elem => elem.Id == e.CollegeId);
        // console.log(filterArray);
        e['CollegeName'] = filteredClg[0].Name;
      });
      // const entityManager = getManager();
     /*  let countsCollegeWise =   await userRepo.createQueryBuilder('user')
                                .where({UniversityId : approver.UniversityId })
                                 .select("Count(*)","countPerCollege")
                                 .leftJoinAndSelect('User.College' , 'College')
                                 .groupBy('CollegeId')
                                 .orderBy('count(*)', 'DESC')
                                 .getOne() */
       /* let countsCollegeWise1  =   await entityManager.query(`select  cl.Name as CollegeName, count(us.Firstname) as countPerCollege  from user us 
       right join college cl ON (us.CollegeId = cl.Id) 
       where us.UniversityId = ${approver.UniversityId}
       group By cl.Name 
       order By  count(us.Firstname)  DESC`);
      console.log('cl' , countsCollegeWise1); */
      res.send(countsCollegeWise);
    } catch(e) {
      res.send(e)
    }
}
};

export default UserController;