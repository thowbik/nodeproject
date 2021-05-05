import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import { User } from "../entity/User";

export class CreateAdminUser1586866088283 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        let user = new User();
        user.CityTown = "Chennai";
        user.Password = "admin";
        user.Firstname ="admin";
        user.IsNewPassword = false;
        user.Lastname ="admin";
        user.MobileNumber="9876543210";
        user.Email="admin@xenovex.com";
        user.StatusType=true;
        user.CreationUserId="Admin";
        user.LastChangeUserId="Admin";
        user.RoleId=1;
        user.DistrictId=0;
        user.StateId=0;
        user.IsDonatedBlood=true;
        user.IsStudent=true;
        user.ClubType=1;
        user.AadhaarNo=9876543210;        
        user.hashPassword();
        const userRepository = getRepository(User);
        await userRepository.save(user);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
