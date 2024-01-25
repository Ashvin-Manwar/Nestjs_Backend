import { DeleteResult, Repository, SelectQueryBuilder } from "typeorm";
import { Event, PaginatedEvents } from "./event.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";
import { PaginateOptions, paginate } from "../pagination/paginator";
import { CreateEventDto } from "./input/create-event.dto";
import { User } from "./../auth/user.entity";
import { UpdateEventDto } from "./input/update-event.dto";
import { Query } from '@nestjs/graphql';

@Injectable()
export class EventsService {
    private readonly logger=new Logger(EventsService.name)
constructor(
    @InjectRepository(Event)
    private readonly eventsRepository:Repository<Event | undefined>
    ){}
    private getEventsBaseQuery():SelectQueryBuilder<Event>{
        return this.eventsRepository
        .createQueryBuilder('e')
        .orderBy('e.id','DESC')
    }

    public async getEvent(id:number):Promise<Event |undefined>{
        const query=this.getEventsBaseQuery()
        .andWhere('e.id = :id',{id})
        this.logger.debug(query.getSql())
        return await query.getOne()
    }
    
    public getEventsWithAttendeeCountQuery():SelectQueryBuilder<Event>{
        return this.getEventsBaseQuery()
        .loadRelationCountAndMap(
            'e.attendeeCount',
            'e.attendees' //relation name
        )
        .loadRelationCountAndMap(
            'e.attendeeAccepted',//who acccepted the invites
            'e.attendees',//relati0n event
            'attendee',//alies
            (qb)=>qb.where('attendee.answer= :answer',{answer:AttendeeAnswerEnum.Accepted})
            )
        .loadRelationCountAndMap(
            'e.attendeeMaybe',
            'e.attendees',
            'attendee',
            (qb)=>qb.where('attendee.answer= :answer',{answer:AttendeeAnswerEnum.Maybe})
            )
        .loadRelationCountAndMap(
            'e.attendeeRejected',
            'e.attendees',
            'attendee',
            (qb)=>qb.where('attendee.answer= :answer',{answer:AttendeeAnswerEnum.Rejected})
            )
    }

    private getEventsWithAttendeeCountFilteredQuery(
    // private async getEventsWithAttendeeCountFiltered(
        filter?:ListEvents
        ):SelectQueryBuilder<Event>{
        let query=this.getEventsWithAttendeeCountQuery()

        if (!filter) {
            // return query.getMany()
            //got pagination
            return query
        }
        if (filter.when) {
            if (filter.when== WhenEventFilter.Today) {
                query=query.andWhere(`e.when>=CURDATE() AND e.when<=CURDATE()+INTERVAL 1 DAY`)
            }
            if (filter.when == WhenEventFilter.Tommorow) {
                query = query.andWhere(
                  `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`,
                );
              }
        
              if (filter.when == WhenEventFilter.Thisweek) {
                query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
              }
        
              if (filter.when == WhenEventFilter.Nextweek) {
                query = query.andWhere(
                  'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
                );
              }
            }
            // return await query.getMany()
            //for pagination
            return  query
    }

    public async getEventsWithAttendeeCountFilteredPaginated(
        filter:ListEvents,
        PaginateOptions:PaginateOptions
    ):Promise<PaginatedEvents>{
        return await paginate<Event,PaginatedEvents>(
            await this.getEventsWithAttendeeCountFilteredQuery(filter),
            PaginatedEvents,
            PaginateOptions
        )
    }

    public async getEventWithAttendeeCount(
        id:number
        ):Promise<Event |undefined>{
        // const query= await this.getEventsBaseQuery()
        const query= await this.getEventsWithAttendeeCountQuery()
        .andWhere('e.id=:id',{id})

        this.logger.debug(query.getSql())// to print  sql that generate to execute
        return await query.getOne()
    }


  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventsRepository.findOne({ where: { id } });
  }

    public async createEvent(
        input:CreateEventDto,
        user:User
        ):Promise<Event>{       // console.log(user)
        return await this.eventsRepository.save(
            new Event({
                ...input,
                organizer:user,
                when:new Date(input.when)
            })
        )
    }

    public async updateEvent(
        event:Event,
        input:UpdateEventDto
        ):Promise<Event>{
        return await this.eventsRepository.save(
            new Event({
                ...event,
                ...input,
                when: input.when ? new Date(input.when) :  event.when
              })
        )
    }

    public async deleteEvent(id:number):Promise<DeleteResult>{
        return await this.eventsRepository
        .createQueryBuilder('e')
        .delete()
        .where('id=:id',{id})
        .execute()
    }

    public async getEventsOrganizedByUserIdPaginated(
        userId:number,
        paginateOptions:PaginateOptions
        ):Promise<PaginatedEvents>{
            return await paginate<Event,PaginatedEvents>(
                this.getEventsOrganizedByUserIdQuery(userId),
                PaginatedEvents,
                paginateOptions
            )
    }

    private getEventsOrganizedByUserIdQuery(
        userId:number
        ):SelectQueryBuilder<Event>{
        return this.getEventsBaseQuery()
        .where('e.organizerId = :userId',{userId})
    }

    public async getEventsAttendedByUserIdPaginated(
        userId:number,
        paginateOptions:PaginateOptions
        ):Promise<PaginatedEvents>{
            return await paginate<Event,PaginatedEvents>(
                this.getEventsAttendedByUserIdQuery(userId),
                PaginatedEvents,
                paginateOptions
            )
    }

    private getEventsAttendedByUserIdQuery(
        userId:number
        ):SelectQueryBuilder<Event>{
        return this.getEventsBaseQuery()
        .leftJoinAndSelect('e.attendees','a')
        .where('a.userId = :userId',{userId})
    }
}