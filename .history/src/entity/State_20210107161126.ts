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
export class action_items {
    
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Id: number;

    @Column()
    @Length(0, 50)
    Name: string;

    @Column()
    @Length(0, 50)
    TamilName: string;

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

    @Column({ type: "boolean" })
    StatusType: boolean;
    @OneToMany(type => District, district => district.State, {
        cascade: true,
    })
    @JoinColumn()
    District: District[];
}