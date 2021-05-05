import {ViewEntity, ViewColumn} from "typeorm";


export class LeadBoardView {

    @ViewColumn()
    Id: number;

    @ViewColumn()
    StateId: number;

    @ViewColumn()
    UserId: number;

    @ViewColumn()
    DistrictName: string;

    @ViewColumn()
    StateName: string;


    @ViewColumn()
    Firstname: string;

    @ViewColumn()
    Lastname: string;

    @ViewColumn()
    MobileNumber: string;   
    

    @ViewColumn()
    ConsolationLevel: number;
    

    @ViewColumn()
    TimeTaken: number;

    @ViewColumn()
    CorrectAnswer: number;

    @ViewColumn()
    NoOfQuestion: number;

    @ViewColumn()
    NationalLevel: number;

    @ViewColumn()
    StateLevel: number;

    @ViewColumn()
    DistrictLevel: number;

    IsStateFirst:Boolean;
    IsDistrictFirst:Boolean;
}