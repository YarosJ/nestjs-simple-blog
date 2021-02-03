import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  UnauthorizedException,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signUp({ username, password }: AuthCredentialsDto): Promise<void> {
    const salt: string = await bcrypt.genSalt();

    try {
      await this.userModel.create({
        username,
        salt,
        password: await bcrypt.hash(password, salt),
      });
    } catch (error) {
      if (error.code === 11000) { // Duplicate username
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn({ username, password }: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const user: UserDocument = await this.userModel.findOne({ username });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);

    this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);

    return { accessToken };
  }
}
