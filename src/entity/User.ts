
/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *           name: Alexander
 *           email: fake@email.com
 */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
    ManyToOne
  } from "typeorm";
  import { Length, IsNotEmpty } from "class-validator";
  import * as bcrypt from "bcryptjs";
// import { QuestionOption } from "./QuestionOption";
// import { QuestionAnswer } from "./QuestionAnswer";
// import { QuestionSet } from "./QuestionSet";

  @Entity()
  // @Unique(["MobileNumber"])
  // @Unique(["AadhaarNo"])
  // @Unique(["Email"])
  export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Id: number;
  
    @Column()
    @Length(0, 50)
    Firstname: string;

    @Column()
    @Length(0, 50)
    Lastname: string;

    @Column()
    @Length(0,250)
    Password: string;

    @Column()
    @Length(0,250)
    PasswordRaw: string;

    @Column()
    Email: string;
      
    @Column()
    MobileNumber: string;

    @Column({ type: 'bigint' })
    DistrictId: number;

    @Column({ type: 'bigint' })
    StateId: number;

    @Column()
    CityTown: string;

    @Column()
    RoleId: number;

    @Column({type: "boolean", nullable : true})
    IsDonatedBlood: boolean;
    
    @Column({type: "boolean", nullable : true})
    IsStudent: boolean;

    @Column({nullable: true})
    ClubType: number;

    @Column({ type: 'bigint', nullable : true })
    AadhaarNo: number;
    

    @Column()
    @CreateDateColumn()
    CreationTs: Date;
  
    @Column()
    @UpdateDateColumn()
    LastChangeTs: Date;

    @Column()
    CreationUserId: string;

    @Column()
    LastChangeUserId: string;

    @Column({type: "boolean"})
    StatusType: boolean;

    @Column({type: "boolean"})
    IsNewPassword: boolean;

    @Column({type: "boolean"})
    ApprovedRRCMember: boolean;

    @Column({nullable : true})
    ApprovalUserId: string;

    @Column({nullable : true})
    ApprovalTs: Date;
    
    @Column({nullable : true})
    UserName: string;

    @Column({nullable : true})
    PODesignation : string;

    // @OneToMany(type => QuestionAnswer, i => i.User, {
    //   cascade: false,
    // })
    // @JoinColumn()
    // QuestionAnswer: QuestionAnswer[];

    hashPassword() {
      this.Password = bcrypt.hashSync(this.Password, 8);
    }
  
    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      return bcrypt.compareSync(unencryptedPassword, this.Password);
    }

    DistrictName:string

    StateName:string

    RoleName: string;

    @Column({type: "boolean"})
    MemberOfRRC: boolean;

    @Column({nullable: true})
    UniversityId: number;

    @Column({nullable: true})
    CollegeId: number;

    @Column({nullable: true})
    StudentRegNo: string;

    @Column({nullable: true})
    AcademicYear: string;

    @Column({nullable: true})
    YearOfStudying: string;

    @Column({nullable: true})
    QuestionSetId: number;
   /*  @ManyToOne(type => QuestionSet, i => i.questionSetId)
    QuestionSetId: QuestionSet;   */

    setrolename()
    {
      let data;
      const fs = require('fs');
      try {data = fs.readFileSync('Role.json');}
      catch (error) { }
      let userroles = JSON.parse(data);
      for (var i = 0; i < userroles.length; i++) 
      {
        var roledr = userroles[i];
        if(roledr["Id"] == this.RoleId)
        {
          this.RoleName =  roledr["RoleName"];
        }
      }
    }
  }