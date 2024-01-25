import { ClassSerializerInterceptor, Controller, Get, Post, Request, SerializeOptions, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { User } from "./user.entity";
import { AuthGuardLocal } from "./auth-guard.local";
import { AuthGuardJwt } from "./auth-guard.jwt";

@Controller('auth')
@SerializeOptions({strategy:'excludeAll'})
export class AuthController {
 constructor(
    private readonly authService:AuthService
 ){}

@Post('login')
@UseGuards(AuthGuardLocal)
// @UseGuards(AuthGuard('local'))
async login(@CurrentUser() user:User) {
   return {
      userId:user.id,
      token:this.authService.getTokenForUser(user)
  }
//  async login(@Request() request) {
//     return {
//         userId:request.user.id,
//       //   token:this.authService.getTokenForUser(request.user)
//         token:'the token will go here'
//     }
 }

 @Get('profile')
 @UseGuards(AuthGuardJwt)
 @UseInterceptors(ClassSerializerInterceptor)
//  @UseGuards(AuthGuard('jwt'))
 async getProfile(@CurrentUser() user:User){
    return user
//  async getProfile(@Request() request){
   //  return request.user
 }
}