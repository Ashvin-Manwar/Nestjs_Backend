import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendee } from "./attendee.entity";
import { User } from "./../auth/user.entity";
import { Expose } from "class-transformer";
import { Paginated } from "./../pagination/paginator";

@Entity()
export class Event {
  constructor(partial?:Partial<Event>){
    Object.assign(this,partial)
  }

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  when: Date;
  
  @Column()
  @Expose()
  address: string;

  @OneToMany(()=>Attendee,(attendee)=>attendee.event,{// eager:true,
    cascade:true    // cascade:['insert','update']
  })
  
  @Expose()
  attendees:Attendee[]

  
  // @JoinColumn({name:'organizerId'})
@ManyToOne(()=>User,(user)=>user.organized)
@Expose()
organizer:User

@Column({nullable:true})
organizerId:number


//   //for queryBUilder  > j0in and Aggregator
//   //Virtual properties
@Expose()
  attendeeCount?:number//this not read or save to database
  @Expose()
  attendeeRejected?:number
  @Expose()
  attendeeMaybe?:number
  @Expose()
  attendeeAccepted?:number
    
}

export class PaginatedEvents extends Paginated<Event>(Event){}
// export type PaginatedEvents=PaginationResult<Event>{}
