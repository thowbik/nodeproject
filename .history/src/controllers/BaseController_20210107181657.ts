import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { District } from "../entity/District";
import { State } from "../entity/State";
import { Faq } from "../entity/Faq";
import { University } from "../entity/University";
import { College } from "../entity/College";

class BaseController {

  static listAllState = async (req: Request, res: Response) => {
    const StateRepository = getRepository(Faq);
    const stateList = await StateRepository.find({
      select: ["id", "topic"]
    });
    res.send(stateList);

  };

  // static listAllState = async (req: Request, res: Response) => {
  //   const StateRepository = getRepository(State);
  //   const stateList = await StateRepository.find({
  //     select: ["Id", "Name"]
  //   });
  //   res.send(stateList);

  // };

  // static listAllDistrict = async (req: Request, res: Response) => {
  //   const stateId: string = req.params.stateId;
  //   const DistrictRepository = getRepository(District);
  //   const districtList = await DistrictRepository.find({
  //     // relations: ['State'],
  //     // where: { Id: stateId },
  //     where: { State: { Id: stateId } , StatusType : true},
  //     select: ["Id", "Name"] 
  //   });
  //   // const districtList = await getRepository(State)
  //   // .findOne(stateId, { relations: ["District"] });
  //   res.send(districtList);

  // };
  // static universityList = async (req: Request, res: Response) => {
  //   /* const collegeRepo = getRepository(College);
  //   const userbenl = await collegeRepo.find();
  //   for (let i = 0; i < userbenl.length; i++ ) {
  //      const findben = userbenl[i];
  //      findben.Management = 'Private';
  //      findben.InstitutionType = 'Arts & Science';
  //      findben.RRCCurrentStatus = 'Functioning';
  //      findben.NoOfRRCUnit = 1;
  //      await collegeRepo.save(findben)
  //   } */
  //   const universityRepo = getRepository(University);
  //   const universityList = await universityRepo.find({
  //     order : {
  //       Name : "ASC"
  //     }
  //   })
  //   res.send(universityList)
  // }
  // static collegeList = async (req: Request, res: Response) => {
  //   const univId = Number(req.params.univeristyId);
  //   const collegeRepo = getRepository(College);
  //   const collegeList = await collegeRepo.find({
  //     where : {
  //       // universityId : 1
  //        University: { Id: univId } 
  //     },
  //     order : {
  //       Name : "ASC"
  //     }
  //   })
  //   res.send(collegeList)
  // }
  // static collegeName = async (req: Request, res: Response) => {
  //   try {
  //     const collegeId = Number(req.params.collegeId);
  //     const collegeRepo = getRepository(College);
  //     const collegeName = await collegeRepo.findOne({
  //       where : {
  //         // universityId : 1
  //          Id : collegeId
  //       }
  //     })
  //     res.send(collegeName)
  //   } catch(e){
  //     res.send(e)
  //   }
   
  // }
  // static collegeListFromDt = async (req: Request, res: Response) => {
  //   try {
  //     const dtId = Number(req.params.districtId);
  //   const collegeRepo = getRepository(College);
  //   const collegeList = await collegeRepo.find({
  //     where : {
  //       // universityId : 1
  //        District: { Id: dtId } ,
  //       select: ["Id", "Name"]
  //     },
  //     order : {
  //       Name : "ASC"
  //     }
  //   })
  //   res.send(collegeList)
  //   } catch(e){
  //     res.send(e)
  //   }
    
  // }
  // static universityFromClg = async (req: Request, res: Response) => {
  //   try {
  //     const collegeId = Number(req.params.collegeId);
  //     const collegeRepo = getRepository(College);
  //     const collegeDetails = await collegeRepo.findOneOrFail({where : {
  //       // universityId : 1
  //        Id:  collegeId
  //     },
  //     relations : ['University']
  //     })
  //     const UniversityRep = getRepository(University);
  //     const univId = collegeDetails.University.Id
  //     const universityName = await UniversityRep.find({
  //       select: ["Id", "Name"],
  //       where : {
  //          Id : univId
  //       }
  //     })
  //     res.send(universityName)
  //   } catch(e) 
  //   {
  //     res.send(e)
  //   }
   
    
  // }
  // static listAllRoles = async (req: Request, res: Response) => {

  //   const currentuserid: string = req.params.currentuserId.toString();

  //   const userRepository = getRepository(User);
  //   const currentuser = await userRepository.findOneOrFail(currentuserid);
  //   let data;
  //   const fs = require('fs');
  //   try { data = fs.readFileSync('Role.json'); }
  //   catch (error) { }
  //   var userroles = JSON.parse(data);

  //   if (currentuser.RoleId == 1) {
  //     var rtnuserroles = userroles.filter(item => item.Id > 1);
  //     res.send(rtnuserroles);
  //     return;
  //   }
  //   else if (currentuser.RoleId == 2) {
  //     var rtnuserroles = userroles.filter(item => item.Id > 2);
  //     res.send(rtnuserroles);
  //     return;
  //   }
  //   else {
  //     var rtn = {
  //       IsSuccessfull: false,
  //       Message: "No Roles avaiable"
  //     }
  //     res.send(rtn);
  //     return;
  //   }
  // };
};

export default BaseController;