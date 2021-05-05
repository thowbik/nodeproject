import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
  } from "typeorm";
  import { Length, IsNotEmpty } from "class-validator";
import { State } from "./State";
  
  @Entity()
  // @Unique(["Name"])
  export class Config {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Id: number;
  
    @Column()
    Key: string;
    
    @Column()
    Value: string; 
    
    @Column()
    Description: string;     
   
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
  }