import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { UserDTO } from '../dtos/user.dto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserDAO extends BaseDAO<UserDocument, UserDTO> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const filter = { email };
    const users = await this.find(filter, ['*'], 1, 1);
    return users.data.length > 0 ? users.data[0] : null;
  }
  async findByUserId(userId: string): Promise<UserDTO | null> {
    const filter = { userId };

    const users = await this.find(filter, ['*'], 1, 1);
    return users.data.length > 0 ? users.data[0] : null;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const users = await this.find({ username }, ['*'], 1, 1);
    return users.data.length > 0;
  }

  async searchUsers(filter: any, page: number, perPage: number): Promise<PaginatedData<UserDTO>> {
    return this.find(filter, ['*'], page, perPage);
  }
}
