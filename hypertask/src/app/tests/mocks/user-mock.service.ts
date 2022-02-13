import { IUserService } from 'src/app/interfaces/i-user-service';
import { Injectable } from '@angular/core';
import { User } from 'src/app/models/Core/user';
import { UserConfig } from 'src/app/models/Core/user-config';
import { Language } from 'src/app/models/Core/language.enum';

@Injectable()
export class UserMockService implements IUserService {
  private users: User[] = [];
  private currentUser: User;

  constructor() {}

  public async getUser(userId: string): Promise<User> {
    const index = this.users.findIndex(p => p.UserId === userId);
    if (index === -1) {
      return null;
    } else {
      return this.users[index];
    }
  }

  public async getCurrentUser(): Promise<User> {
    return this.currentUser;
  }

  public async getCurrentUserId(): Promise<string> {
    if (this.currentUser != null) {
      return this.currentUser.UserId;
    } else {
      return null;
    }
  }

  public getUserConfig(): UserConfig {
    return this.currentUser.Config;
  }

  public async saveUser(user: User): Promise<void> {
    this.currentUser = user;
    this.users.push(user);
  }

  public setLanguage(value: any): void {
    if (Number(value) === Language.French) {
      User.setConfig(this.currentUser, UserConfig.PreferedLanguageKey, Language.French);
    } else {
      User.setConfig(this.currentUser, UserConfig.PreferedLanguageKey, Language.English);
    }
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
  }

  public async setCloudSync(value: boolean) {
    return;
  }

  public getUserForLogin(): Promise<User> {
    // return this.getUser();
    return this.getUser(null); // not good need id ?
  }

  public getCurrentUserAfterLogin(): Promise<User> {
    return this.getCurrentUser();
  }

  public awaitUserReady(): Promise<boolean> {
    return;
  }

  public setDefaultNonRecurringGroupId(groupId: string) {
    return User.setConfig(this.currentUser, UserConfig.DefaultNonRecurringGroupId, groupId);
  }

  public setDefaultRecurringGroupId(groupId: string) {
    return User.setConfig(this.currentUser, UserConfig.DefaultRecurringGroupId, groupId);
  }

  public setDefaultRecurringPositionName(value: string) {
    User.setConfig(this.currentUser, UserConfig.DefaultRecurringAfterTaskNameKey, value);
  }

  public setDefaultNonRecurringPositionName(value: string) {
    User.setConfig(this.currentUser, UserConfig.DefaultNonRecurringAfterTaskNameKey, value);
  }

  public getConfig(key: string) {
    return this.currentUser.Config.Configs.get(key);
  }

  public setConfig(key: string, value: any) {
    return this.currentUser.Config.Configs.set(key, value);
  }

  public permanentlyDeleteAccount(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public setKeepPortrait(value: boolean) {
    User.setConfig(this.currentUser, UserConfig.KeepPortrait, value);
  }
}
