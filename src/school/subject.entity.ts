import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from './teacher.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Course } from "./course.entity";

@Entity()
@ObjectType()
// @InputType('SubjectInput')
export class Subject {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;
  
  @Column()
  @Field()
  name: string;

  @ManyToMany(
    () => Teacher, (teacher) => teacher.subjects, { cascade: true }
  )
  @JoinTable( // { joinColumn:{
    //   name:'subjectId', referencedColumnName:'id'},inverseJoinColumn:{ }}
    )
  teachers: Promise<Teacher[]>;//lazy relations 
  // teachers: Teacher[];

  @OneToMany(()=> Course,(course)=>course.subject)
  @Field(()=>[Course],{nullable:true})
  courses:Promise<Course[]>

}