import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import RegisterDTO from './dto/register.dto';
import { PostgresErrorCode } from 'src/database/postgresErrorCodes.enum';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './tokenPayload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registerData: RegisterDTO) {
    console.log('Register Data:', registerData);
  
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    console.log('Hashed Password:', hashedPassword);
  
    try {
      const createdUser = await this.usersService.create({
        ...registerData,
        password: hashedPassword,
      });
      console.log('Created User:', createdUser);
  
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      console.error('Registration Error:', error);
  
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;

      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordMatching)
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
  }

  public getCookieWithJwtToken(userId: number){
    const payload: TokenPayload = {userId};
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_TOKEN'),
      expiresIn: this.configService.get("JWT_EXPIRATION_TIME"),
    });

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }

  public getCookiesForLogOut(){
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public getCookieWithJwtRefreshToken(userId: number){
    const payload: TokenPayload = {userId};
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
    });

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;

    return {cookie, token};
  }
}
