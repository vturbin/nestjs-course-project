import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: Partial<UsersService>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    usersServiceMock = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asd@sfg.com',
          password: '123',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: '123' } as User]);
      },
      // remove: (id: number) => {},
      // update: (id: number, attrs) => {},
    };
    authServiceMock = {
      // signup: (email, password) => {},
      signin: (email, password) => {
        return Promise.resolve({ id: 1, email, password });
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asd@sfg.com');
    expect(users.length).toEqual(1);
  });

  it('findUser throws an error if user with given id is not found', async () => {
    usersServiceMock.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('findUser should return a user', async () => {
    usersServiceMock.findOne = () => {
      return Promise.resolve({
        id: 1,
        email: 'opk@ko.com',
        password: '123',
      } as User);
    };
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('signin updates session objet and returns user', async () => {
    const session = { userId: null };
    const user = await controller.signin(
      {
        email: 'mo@ko.com',
        password: '1sda',
      },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
