import { User } from '../models/Core/user';

export abstract class IUserService {
  abstract getUser(userId: string): Promise<User>;
  abstract getUserForLogin(): Promise<User>;
  abstract getCurrentUser(): Promise<User>;
  abstract getCurrentUserId(): Promise<string>;
  abstract saveUser(user: User): Promise<void>;
  abstract setLanguage(value: any);
  abstract setCloudSync(value: boolean);
  abstract setDefaultRecurringPositionName(value: string);
  abstract setDefaultNonRecurringPositionName(value: string);
  abstract logout(): Promise<void>;
  abstract awaitUserReady(waitForever?: boolean): Promise<boolean>;
  abstract setDefaultNonRecurringGroupId(groupId: string): Promise<void>;
  abstract setDefaultRecurringGroupId(groupId: string): Promise<void>;
  abstract getConfig(key: string): any;
  abstract setConfig(key: string, value: any): any;
  abstract permanentlyDeleteAccount(): Promise<boolean>;
  abstract setKeepPortrait(value: boolean);
}
