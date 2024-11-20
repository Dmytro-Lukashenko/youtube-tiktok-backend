import { Args, Mutation, Resolver, Context, Query } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { RegisterResponse, LoginResponse } from 'src/auth/types';
import { RegisterDto, LoginDto } from 'src/auth/dto';
import { Response, Request } from 'express';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { GraphQLErrorFilter } from 'src/filters.ts/custom-exception.filter';
import { User } from './user.model';

@Resolver()
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseFilters(GraphQLErrorFilter)
  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'Password and confirm password are not the same',
      });
    }
    const { user } = await this.authService.register(registerDto, context.res);
    console.log('user!', user);
    return { user };
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: { res: Response },
  ) {
    console.log(loginDto, context.res);
    return this.authService.login(loginDto, context.res);
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    return this.authService.logout(context.res);
  }

  @Mutation(() => String)
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    try {
      return this.authService.refreshToken(context.req, context.res);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) throw new BadRequestException(error.message);
    }
  }

  @Query(() => String)
  async hello() {
    return 'Hello world!';
  }

  @Query(() => [User])
  async getUsers() {
    return this.userService.getUsers();
  }
}
