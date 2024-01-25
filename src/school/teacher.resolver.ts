import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { PaginatedTeachers, Teacher } from './teacher.entity';
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TeacherAddInput } from "./input/teacher-add.input";
import { Logger, UseGuards } from "@nestjs/common";
import { TeacherEditInput } from "./input/teacher-edit.input";
import { EntityWithId } from "./school.types";
import { AuthGuardJwtGql } from "./../auth/auth-guard-jwt.gql";
import { paginate } from "../pagination/paginator";

@Resolver(()=> Teacher)
export class TeacherResolver {
    private  readonly logger=new Logger(TeacherResolver.name)
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository:Repository<Teacher>
    ){}
// @Query(()=> [Teacher])
@Query(()=> PaginatedTeachers)
 public async teachers():Promise<PaginatedTeachers>{
   return paginate<Teacher,PaginatedTeachers>(
      this.teacherRepository.createQueryBuilder(),
      PaginatedTeachers
   )
   //  return await this.teacherRepository.find({
        // relations:['subjects'] // after using lazy relations  we dont need this //  })
//  return [] as Teacher[]
 }

 @Query(()=>Teacher)
 public async teacher(
    @Args('id',{type:()=>Int})
    id:number
 ):Promise<Teacher>{
    return await this.teacherRepository.findOneOrFail({
        where:{
            id
        },
        // relations:['subjects']// after using lazy relations  we dont need this
    })
 }

//  @Mutation(()=> Teacher,{name:'teacherAdd'})
//  public async add(
//     @Args('input',{type:()=> Teacher})
//     teacher:Teacher
//  ):Promise<Teacher>{
//     return await this.teacherRepository.save(teacher)
//  }

 @Mutation(()=> Teacher,{name:'teacherAdd'})
 @UseGuards(AuthGuardJwtGql)
 public async add(
    @Args('input',{type:()=> TeacherAddInput})
    input:TeacherAddInput
 ):Promise<Teacher>{
    return await this.teacherRepository.save(new Teacher(input))
    // return await this.teacherRepository.save(input)
 }
 @Mutation(()=> Teacher,{name:'teacherEdit'})
 public async edit(
    @Args('id',{type:()=> Int})
    id:number,
    @Args('input',{type:()=> TeacherEditInput})
    input:TeacherEditInput
 ):Promise<Teacher>{
    const teacher=await this.teacherRepository.findOneOrFail({
        where:{id}
    })
    return await this.teacherRepository.save(new Teacher(Object.assign(teacher,input)))
 }

 @Mutation(()=>EntityWithId,{name:'teacherDelete'})
 public async delete(
    @Args('id',{type:()=>Int})
    id:number
 ):Promise<EntityWithId>{
    const teacher=await this.teacherRepository.findOneOrFail({
        where:{id}
    })
    await this.teacherRepository.remove(teacher)
    return new EntityWithId(id)
 }
 //Field Resolver
 @ResolveField('subjects')
 public async subjects(@Parent() teacher:Teacher){
    this.logger.debug(`@Resolved Field subjects was called`)
    return await teacher.subjects
 }

}