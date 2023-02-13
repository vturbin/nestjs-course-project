import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { compare, genSalt, hash } from 'bcryptjs';
import { User } from './users.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string): Promise<User> {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }
    // Hash the users password
    const passwordHash = await this.setPassword(password);
    // Create a new user and save it
    const user = await this.usersService.create(email, passwordHash);
    // return user
    return user;
  }

  async signin(email: string, password: string): Promise<User> {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new BadRequestException('Invalid Email or password!');
    }
    const isCorrectPassword = await this.validatePassword(
      password,
      user.password,
    );
    if (!isCorrectPassword) {
      throw new BadRequestException('Invalid Email or password!');
    }
    return user;
  }

  public async setPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt);
    return passwordHash;
  }

  public validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
