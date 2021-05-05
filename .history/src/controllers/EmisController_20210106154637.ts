import { Request, Response } from "express";
import { getRepository, MoreThan } from "typeorm";
import { User } from "../entity/User";
import { College } from "../entity/College";


 class EmisController {

  static listAllData = async (req : Request, res : Response) => {
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

};

export default EmisController;