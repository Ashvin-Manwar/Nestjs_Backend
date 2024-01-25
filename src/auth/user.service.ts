import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./input/create.user.dto";

@Controller()
export class UserService {
    constructor(
      private readonly authService:AuthService,
      @InjectRepository(User)
      private readonly userRepository:Repository<User>
        
    ){}
    public async create(createUserDto:CreateUserDto):Promise<User>{
        return await this.userRepository.save(
            new User({
                ...createUserDto,
                password:await this.authService.hashPassword(createUserDto.password)
            })
        )
    }
}