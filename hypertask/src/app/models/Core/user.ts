import DateUtils from 'src/app/shared/date-utils';
import { UserConfig } from './user-config';

export class User {
  Id: string;
  UserId: string;
  Config: UserConfig;
  LastActivityDate: Date;
  IsNew: boolean;

  constructor() {
    this.Config = new UserConfig();
    this.LastActivityDate = DateUtils.YearAgo();
    this.IsNew = false;
  }

  public static getConfig(user: User, key: string): any {
    // console.log('getconfig,', user);
    return user.Config.Configs.get(key);
  }

  public static setConfig(user: User, key: string, value: any): any {
    // console.log('setConfig,', user);
    return user.Config.Configs.set(key, value);
  }
}
