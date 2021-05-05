import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";
import { District } from "./District";

@Entity()
@Unique(["Name"])
export class State {
    
    @PrimaryGeneratedColumn({ type: 'bigint' })
    action_id: number;

    @Column()
    @Length(0, 256)
    action_name: string;

    @Column()
    @Length(0, 50)
    param_id: number;

    @Column()
    @Length(0, 256)
    priority: string;

    @Column()
    is_active: number;

}