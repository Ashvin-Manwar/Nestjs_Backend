import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./input/create.user.dto";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "./user.service";

@Controller('users')
export class UsersController {
    constructor(
        private readonly authService:AuthService,
        // @InjectRepository(User)
        // private readonly userRepository:Repository<User>,
        private readonly userService:UserService
    ){}

    @Post()
    async create(@Body() createUserDto:CreateUserDto){
        // const user=new User()
        // if (createUserDto.password !== createUserDto.retypedPassword) {
        // throw new BadRequestException(['Password are not identical'])    
        // }

        // const existingUser= await this.userRepository.findOne({
        //     where:[
        //         {username:createUserDto.username},
        //         {email:createUserDto.email}
        //     ]
        // })
        // if (existingUser) {
        //     throw new BadRequestException(['username or email is already taken'])
        // }
        // user.username=createUserDto.username
        // user.password=await this.authService.hashPassword(createUserDto.password)
        // user.email=createUserDto.email
        // user.firstName=createUserDto.firstName
        // user.lastName=createUserDto.lastName

        // return {
        //     ...(await this.userRepository.save(user)),
        //     token:this.authService.getTokenForUser(user)
        // }
        const user=await this.userService.create(createUserDto)
        return {
            ...user,
            token:this.authService.getTokenForUser(user)
        }
        
    }
}