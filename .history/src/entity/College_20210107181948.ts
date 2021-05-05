// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     Unique,
//     CreateDateColumn,
//     UpdateDateColumn,
//     OneToMany,
//     JoinColumn,
//     ManyToOne
// } from "typeorm"
// import { District } from "./District";
// import { University } from "./University";

// @Entity()
// export class College {
//     @PrimaryGeneratedColumn({ type: 'bigint' })
//     Id: number;

//     @Column()
//     Name: string;

//     @Column()
//     @CreateDateColumn()
//     CreationTs: Date;

//     @Column()
//     @UpdateDateColumn()
//     LastChangeTs: Date;

//     @Column()
//     CreationUserId: string;

//     @Column()
//     LastChangeUserId: string;

//     @Column({ type: "boolean" })
//     StatusType: boolean;

//     @ManyToOne(type => University, i => i.College)
//     University: University;  

//     @ManyToOne(type => District, i => i.College)
//     District: District; 

//     @Column()
//     Management: string;

//     @Column()
//     InstitutionType: string
    
//     @Column()
//     RRCCurrentStatus: string

//     @Column()
//     NoOfRRCUnit: number

   
// }