import { DTOUserConfig } from './dto-user-config';
import { User } from '../Core/user';

export class DTOUser {
  Id: string;
  UserId: string;
  Config: DTOUserConfig;
  LastActivityDate: string;

  constructor() {
    this.Config = new DTOUserConfig();
  }

  public static FromUser(user: User): DTOUser {
    const newUser = new DTOUser();
    newUser.Config = DTOUserConfig.FromUserConfig(user.Config);
    newUser.Id = user.Id;
    newUser.UserId = user.UserId;
    newUser.LastActivityDate = user.LastActivityDate == null ? null : user.LastActivityDate.toISOString();
    return newUser;
  }

  public static ToUser(user: DTOUser): User {
    if (user == null) {
      return new User();
    }

    const newUser = new User();
    newUser.Config = DTOUserConfig.ToUserConfig(user.Config);
    newUser.Id = user.Id;
    newUser.LastActivityDate = user.LastActivityDate == null ? null : new Date(user.LastActivityDate);
    newUser.UserId = user.UserId;
    return newUser;
  }
}
