import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt"
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    // private readonly logger=new Logger(LocalStrategy.name)
    constructor(private readonly authService:AuthService){
        super()
    }
        //transfer to auth.service
        // @InjectRepository(User)
        // private readonly userRepository:Repository<User>){super()}

     public async validate(username:string,password:string):Promise<any>{
        return await this.authService.validateUser(username,password)
        //transfer to auth service
        // const user=await this.userRepository.findOne({
        //   where:{username}  
        // })

        // if (!user) {
        //     this.logger.debug(`User ${username} not found`)
        //     throw new UnauthorizedException()
        // }
        // // if (password !== user.password) {
        // if (!(await bcrypt.compare(password,user.password))) {
        //     this.logger.debug(`Invalid credentials for user ${username}`)
        //     throw new UnauthorizedException()
        // }
        // return user
    }
}