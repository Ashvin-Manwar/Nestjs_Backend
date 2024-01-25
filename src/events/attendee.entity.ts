import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";
import { Expose } from "class-transformer";
import { User } from "./../auth/user.entity";

export enum AttendeeAnswerEnum {
    Accepted=1,
    Maybe,
    Rejected
}

@Entity()
export class Attendee{
    @PrimaryGeneratedColumn()
    @Expose()
    id:number

    // @Column()
    // @Expose()
    // name:string

    @ManyToOne(()=>Event,(event)=>event.attendees,{
        nullable:false, // nullable:true//trying to get error and get All eventid NULL indatabsse
        onDelete:'CASCADE'
    })
    @JoinColumn()
    event:Event

    @Column()
    eventId:number

    @Column('enum',{
        enum:AttendeeAnswerEnum,
        default:AttendeeAnswerEnum.Accepted
    })
    @Expose()
    answer:AttendeeAnswerEnum

    @ManyToOne(()=>User,(user)=>user.attended)
    @Expose()
    user:User

    @Column()
    userId:number

}