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
export class faq {
    
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    @Length(0, 20)
    topic: string;

    @Column()
    @Length(0, 30)
    sub_topic: string;

    @Column()
    @Length(0, 500)
    questions: string;

    @Column()
    @Length(0, 500)
    response: string;

    @Column()
    @Length(0, 500)
    keywords: string;

    @Column()
    @Length(0, 500)
    image: string;
}