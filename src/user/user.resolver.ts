import { Args, Mutation, Resolver, Context, Query } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { RegisterResponse, LoginResponse } from 'src/auth/types';
import { RegisterDto, LoginDto } from 'src/auth/dto';
import { Response, Request } from 'express';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class UserResolver {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) { }

    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response },
    ): Promise<RegisterResponse> {

        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException({
                confirmPassword: 'Password and confirm password are not the same'
            })
        }
        try {
            const { user } = await this.authService.register(
                registerDto,
                context.res
            )
            console.log('user!', user);
            return { user }
        } catch (error: unknown) {
            console.error(error)
            if (error instanceof Error) return {
                error: {
                    message: error.message
                }
            }
        }

    }

    @Mutation(() => LoginResponse)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response },
    ) {
        return this.authService.login(loginDto, context.res)
    }

    @Mutation(() => String)
    async logout(
        @Context() context: { res: Response }
    ) {
        return this.authService.logout(context.res)
    }

    @Mutation(() => String)
    async refreshToken(
        @Context() context: { req: Request, res: Response }
    ) {
        try {

            return this.authService.refreshToken(context.req, context.res)

        } catch (error: unknown) {
            console.error(error)
            if (error instanceof Error) throw new BadRequestException(error.message)
        }
    }

    @Query(() => String)
    async hello() {
        return 'Hello world!';
    }
}