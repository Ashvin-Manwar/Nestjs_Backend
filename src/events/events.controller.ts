/* eslint-disable prettier/prettier */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { Event } from './event.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { CurrentUser } from './../auth/current-user.decorator';
import { User } from './../auth/user.entity';
import { AuthGuardJwt } from './../auth/auth-guard.jwt';

@Controller('/events')
@SerializeOptions({strategy:'excludeAll'})
export class EventsController {
  private readonly logger =new Logger(EventsController.name)
  constructor( 
    // @InjectRepository(Event)
    // private readonly repository:Repository<Event>,
    // @InjectRepository(Attendee)
    // private readonly attendeeRepository:Repository<Attendee>,
    private readonly eventsService:EventsService
    ){}
    // private events: Event[] = [];
    
    @Get()//Pagination
    @UsePipes(new ValidationPipe({transform:true}))//to make query classes populated with default
    //when default are not provided
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Query() filter :ListEvents) {
      const events=await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total:true,
          currentPage:filter.page,
          limit:2
        }
        )
      return events
    }

    // @Get()//Filtering data
    // async findAll(@Query() filter :ListEvents) {
    //   this.logger.debug(filter)
    //   this.logger.log(`Hit the findAlll route`)
    //   const events=await this.eventsService.getEventsWithAttendeeCountFiltered(filter)
    //   this.logger.debug(`Found ${events.length} events`)
    //   return events
    // }

  // @Get()
  // async findAll() {
  //   this.logger.log(`Hit the findAlll route`)
  //   const events=await this.repository.find()
  //   this.logger.debug(`Found ${events.length} events`)
  //   return events
  // //   // return await this.repository.find()
  // //   // return [{ id: 1, name: 'First events' },{ id: 2, name: 'Second events' },];
  // }

// @Get('/practice')
// async practice(){
// return await this.repository.find({
//   select:['id','when'],
//   where:[{
//     id:MoreThan(3),
//     when:MoreThan(new Date('2021-02-12T13:00:00'))
//   },{// conditionOR
//     description:Like('%meet%')
//   }],
//   take:2,//limit 2
// order:{
//   id:'DESC'
// }
//   // where:{id:3}
// })
// }


  // @Get('practice2')
  // async practice2(){
  //   const event=await this.repository.findOne({
  //     where:{id:1},
  //   relations:['attendees']
  // })//1-3

  // //Associating Related Entities
  // // const event =await this.repository.findOne({    where:{id:1}  })
  
  // // const attendee=new Attendee()
  // // attendee.name='Jerry'
  // // attendee.event=event
  // // await this.attendeeRepository.save(attendee)
  
  // // const event=new Event()//2
  // // event.id=1//2

  // const attendee=new Attendee()
  //   // attendee.name='Jerry The Second'//2
  //   attendee.name='Using cascade'//3
  //   // attendee.event=event//2
  //   // await this.attendeeRepository.save(attendee)
    
  //   event.attendees.push(attendee)//3
  //   // event.attendees=[]// it will null the all  EVENTID
  //   await this.repository.save(event)//3

  //   return event
    // return await this.repository.createQueryBuilder('e')
    // .select(['e.id','e.name'])
    // .orderBy('e.id','ASC')
    // .take(3)
    // .getMany()
  // }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id',ParseIntPipe) id:number) {
    // console.log(typeof id)
    //  const event= await this.repository.findOneBy({id})
     const event= await this.eventsService.getEventWithAttendeeCount(id)
    if (!event) {
      throw new NotFoundException();
    }
    return event
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
 async create(
  @Body() input: CreateEventDto,
  @CurrentUser() user:User
  ) {
    return await this.eventsService.createEvent(input,user)
  }
//   @Post()
//  async create(@Body(
//   // new ValidationPipe({groups:['create']})
//  ) input: CreateEventDto) {
//     return await this.repository.save({
//       ...input,
//       when: new Date(input.when),
//     })
//   }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Param('id',ParseIntPipe) id, @Body(
    // new ValidationPipe({groups:['update']})
  ) input: UpdateEventDto,
    @CurrentUser() user:User
  ) {
    const event= await this.eventsService.findOne(id)
    // const event= await this.eventsService.getEventWithAttendeeCount(id)
    // const event=this.repository.findOneBy({id})

    if (!event) {
      throw new NotFoundException();
    }
    
    if ((await event).organizerId!== user.id) {
      throw new ForbiddenException(null,`You are not autherized to change this event`)
    }
    
    return await this.eventsService.updateEvent(event,input)
  }

  //Deleting using QB 
  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id',ParseIntPipe) id,
  @CurrentUser() user:User
  ) {
    const event=await this.eventsService.findOne(id)
    // const event=this.eventsService.getEventWithAttendeeCount(id)
    // const event=this.repository.findOneBy({id})
    if (!event) {
      throw new NotFoundException();
    }
    
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null,`You are not autherized to remove this event`)
    }
     await this.eventsService.deleteEvent(id)
          //  const result= await this.eventsService.deleteEvent(id)
    //  if (result?.affected!==1) {
    //   throw new NotFoundException()
    //  }
  }
  // @Delete(':id')
  // @HttpCode(204)
  // async remove(@Param('id') id) {
  // const event=await this.repository.findOneBy({id})

  // if (!event) {
  //   throw new NotFoundException();
  // }
  //     await this.repository.remove(event)
  // }
} 
// @Get()
// findAll() {
  // return this.events;
  // return [{ id: 1, name: 'First events' },{ id: 2, name: 'Second events' },];
// }

//   @Get(':id')
//   findOne(@Param('id') id) {
//      const event=this.events.find((event)=> event.id=== parseInt(id))
//      return event
//     // return { id: 1, name: 'First events' };
//   }

//   @Post()
//   create(@Body() input: CreateEventDto) {
//     const event = {
//       ...input,
//       when: new Date(input.when),
//       id: this.events.length + 1,
//     };
//     this.events.push(event);
//     return event;
//     // return input
//   }

//   @Patch(':id')
//   update(@Param('id') id, @Body() input: UpdateEventDto) {
//     const index = this.events.findIndex(
//         (event) => event.id === parseInt(id),
//     );
//     this.events[index] = {
//         ...this.events[index],
//         ...input,
//         when: input.when ? new Date(input.when) : this.events[index].when,
//       };
//       return this.events[index];
//       // return input;
//   }

//   @Delete(':id')
//   @HttpCode(204)
//   remove(@Param('id') id) {
//     this.events = this.events.filter((event) => event.id !== parseInt(id));

//   }
// }
