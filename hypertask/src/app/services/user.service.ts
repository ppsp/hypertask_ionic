import { Injectable } from '@angular/core';
import { User } from '../models/Core/user';
import { UserNotFoundError } from '../models/Exceptions/UserNotFoundError';
import { IApiProvider } from '../interfaces/i-api-provider';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../models/Core/language.enum';
import { ILogger } from '../interfaces/i-logger';
import { UnknownLanguageError } from '../models/Exceptions/UnknownLanguageError';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';
import { IUserService } from '../interfaces/i-user-service';
import { IAuthenticationService } from '../interfaces/i-authentication-service';
import { UserConfig } from '../models/Core/user-config';
import { DTOUser } from '../models/DTO/dto-user';
import ThreadUtils from '../shared/thread.utils';
import { EventService, EventData } from './event.service';
import DateUtils from '../shared/date-utils';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IUserService {

  public static currentUser: User;
  public static currentUserId: string;

  constructor(private local: ILocalStorageService,
              private api: IApiProvider,
              private translate: TranslateService,
              private logger: ILogger,
              private auth: IAuthenticationService,
              private eventService: EventService) {}

  public async getUser(userId: string): Promise<User> {
    try {
      //console.log('getUser', userId);

      if (userId == null) {
        return null;
      }

      if (this.local.Initialized === false) {
        //console.log('%%%% INITIALIZING LOCAL IN GETUSER %%%%');
        await this.local.initialize(userId);
      }

      // try to get user from server to get latest

      //console.log('GETTING USER ID : ', userId);
      if (UserService.currentUser != null && UserService.currentUser.UserId === userId) {
        //console.log('got user from ram ', UserService.currentUser);
        return UserService.currentUser;
      } else {
        let dtoUser = await this.local.getUser(userId);
        let user = DTOUser.ToUser(dtoUser);
        if (user != null && user.UserId != null) {
          //console.log('GOT USER FROM LOCAL ', user);
          UserService.currentUser = user;
          //console.log('GOT USER FROM LOCAL2 ', UserService.currentUser);
          return user;
        } else {
          dtoUser = await this.api.getUser(userId);
          user = DTOUser.ToUser(dtoUser);
          //console.log('GetUserFromAPI', user);

          if (user != null && user.UserId != null) {
            //console.log('GOT USER FROM API ', user);
            UserService.currentUser = user;
            await this.local.setUser(DTOUser.FromUser(user), false);
            return user;
          } else {
            //console.log('NO USER FROM API NOT LOCAL, RETURN NEW USER');
            const newUser = new User();
            newUser.UserId = userId;
            newUser.IsNew = true;
            UserService.currentUser = user;
            return newUser;
          }
        }
      }
    } catch (error) {
      this.logger.logError(new Error('Unable to find user : ' + error.message));
      throw new UserNotFoundError('Unable to find user');
    }
  }

  /**
   * Same as getUser but this is for when logging in
   */
  public async getUserForLogin(): Promise<User> {
    try {
      const userId = await this.auth.getUserId();
      this.logger.logDebug('~ GetUserForLogin', new Date().toISOString());

      if (userId == null) {
        return null;
      }

      if (this.local.Initialized === false) {
        this.logger.logDebug('~ Initializing local', new Date().toISOString());
        await this.local.initialize(userId);
        this.logger.logDebug('~ Local Initialized', new Date().toISOString());
      }

      // Get local user first to see if it's first install
      const localDTOUser = await this.local.getUser(userId);
      if (localDTOUser != null) {
        this.logger.logDebug('~ Got User, not a new install, returning user', new Date().toISOString(), JSON.stringify(localDTOUser));

        return DTOUser.ToUser(localDTOUser);
      } else {
        this.logger.logDebug('~ We dont have local user, new install', new Date().toISOString());

        // try to get user from server to get latest
        this.logger.logDebug('getting user from api');
        const apiDTOUser = await this.api.getUser(userId);
        if (apiDTOUser != null) {
          this.logger.logDebug('got user from api, saving locally', JSON.stringify(apiDTOUser));
          const localUser = DTOUser.ToUser(apiDTOUser);
          localUser.LastActivityDate = DateUtils.YearAgo(); // todo save it somewhere so we dont have to get user from api twice
          await this.local.setUser(DTOUser.FromUser(localUser), false);
          this.logger.logDebug('~ User Set', new Date().toISOString());

          return localUser;
        } else {
          this.logger.logDebug('did not get user from api, first install, creating a new one');
          const newUser = new User();
          newUser.UserId = userId;
          newUser.IsNew = true;

          return newUser;
        }
      }
    } catch (error) {
      this.logger.logError(new Error('Unable to find user : ' + error.message));
      throw new UserNotFoundError('Unable to find user');
    }
  }

  public async getCurrentUser(): Promise<User> {
    if (UserService.currentUser == null) {
      const startDate = new Date();
      //console.log('<> GETTING CURRENT USER');
      const id = UserService.currentUserId == null ? await this.auth.getUserId() : UserService.currentUserId;
      UserService.currentUserId = id;
      //console.log('<> GOT USER ID', DateUtils.getTimeSince(startDate), UserService.currentUserId);
      const user = await this.getUser(id);
      //console.log('<> GOT USER', DateUtils.getTimeSince(startDate));
      UserService.currentUser = user;
      //console.log('<> GOT USER', UserService.currentUser);
      return user;
    } else {
      //console.log('<> GETTING CURRENT USER FROM RAM');
      return UserService.currentUser;
    }
  }

  public async awaitUserReady(waitForever?: boolean): Promise<boolean> {
    let iterations = 0;
    while (waitForever === true || iterations < 200) { // 50ms * 100 = 5000 ms = 5s
      //console.log('awaitUserReady');
      if (UserService.currentUser == null || UserService.currentUserId == null) {
        //console.log('currentuser ' + UserService.currentUser);
        await ThreadUtils.sleep(50);
        iterations ++;
      } else {
        this.logger.logDebug('AWAIT COMPLETED, GOT USER : ', JSON.stringify(UserService.currentUser), UserService.currentUserId);
        return true;
      }
    }

    // console.log('AWAIT ABORTED, NEVER GOT USER : ' + new Date().toISOString(), UserService.currentUser, UserService.currentUserId);
    return false;
  }

  public async getCurrentUserId(reason?: string): Promise<string> {
    if (UserService.currentUserId != null) {
      return UserService.currentUserId;
    } else {
      // this.logger.logDebug('GET User GET USERID ', reason);
      const user = await this.getCurrentUser();
      const result = user != null ?
                       user.UserId :
                       null;
      UserService.currentUserId = result;
      return result;
    }
  }

  public getConfig(key: string): any {
    if (UserService.currentUser == null) {
      // console.log('GETCONFIG USER IS NULL', key, UserService.currentUser);

      if (key === UserConfig.EndOfDayTimeKey) { // TODO: Fix bug instead of using this, when logging in it doesnt work
        return '04:00';
      }

      return null;
    } else {
      // console.log('GETCONFIG', key);
      const value = UserService.currentUser.Config.Configs.get(key);
      // console.log('GOT VALUE', value);
      return value;
    }
  }

  public setConfig(key: string, value: any): any {
    if (UserService.currentUser == null) {
      return null;
    } else {
      return UserService.currentUser.Config.Configs.set(key, value);
    }
  }

  public async saveUser(user: User): Promise<void> {
    try {
      console.log('HHHHHHHH SAVING USER');
      user.LastActivityDate = new Date();
      await this.local.setUser(DTOUser.FromUser(user), false);
      await this.api.saveUser(DTOUser.FromUser(user));
      UserService.currentUser = user;
      UserService.currentUserId = user.UserId;
    } catch (error) {
      this.logger.logError(error, { key: 'user', value: JSON.stringify(user)});
    }
  }

  public async setLanguage(value: any) {
    if (Number(value) === Language.French) {
      this.translate.use('fr');
      // this.logger.logDebug('GET User SET LANGUAGE');
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.PreferedLanguageKey, Language.French);
      // console.log('Saving user for language', currentUser);
      this.saveUser(currentUser);
    } else if (Number(value) === Language.English) {
      this.translate.use('en');
      // this.logger.logDebug('GET User SET LANGUAGE');
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.PreferedLanguageKey, Language.English);
      // console.log('Saving user for language', currentUser);
      this.saveUser(currentUser);
    } else {
      this.logger.logEvent('Unable to change language');
      throw new UnknownLanguageError('Unable to change language');
    }

    this.eventService.emit(new EventData(EventService.EventIds.LanguageChanged, null));
  }

  public async setDefaultRecurringPositionName(value: string) {
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.DefaultRecurringAfterTaskNameKey, value);
      // console.log('[Saving User for Recurring Name]', currentUser);
      await this.saveUser(currentUser);
  }

  public async setDefaultNonRecurringPositionName(value: string) {
    const currentUser = await this.getCurrentUser();
    User.setConfig(currentUser, UserConfig.DefaultNonRecurringAfterTaskNameKey, value);
    // console.log('[Saving User for NonRecurringName]', currentUser);
    await this.saveUser(currentUser);
  }

  public async logout(): Promise<void> {
    //console.log('logging out3');
    UserService.currentUser = null;
    UserService.currentUserId = null;
    await this.auth.logout();
    return;
  }

  // TODO : Don't even sync this if they choose privacy
  public async setCloudSync(value: boolean) {
    if (value === true) {
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.EnableCloudSyncKey, true);
      // console.log('Saving user for cloudsync', currentUser);
      this.saveUser(currentUser);
    } else {
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.EnableCloudSyncKey, false);
      // console.log('Saving user for cloudsync2', currentUser);
      this.saveUser(currentUser);
    }
  }

  public async setDefaultNonRecurringGroupId(groupId: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    // console.log('SET DEFAULT NON RECURRING GROUP ID');
    User.setConfig(currentUser, UserConfig.DefaultNonRecurringGroupId, groupId);
    // console.log('[Saving user for NonRecurringGroupId]', currentUser);
    await this.saveUser(currentUser);
  }

  public async setDefaultRecurringGroupId(groupId: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    User.setConfig(currentUser, UserConfig.DefaultRecurringGroupId, groupId);
    // console.log('[Saving user for Recurring GroupId]', currentUser);
    await this.saveUser(currentUser);
  }

  public async permanentlyDeleteAccount(): Promise<boolean> {
    return await this.api.permanentlyDeleteAccount(UserService.currentUserId);
  }

  public async setKeepPortrait(value: boolean) {
    if (value === true) {
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.KeepPortrait, true);
      this.saveUser(currentUser);
    } else {
      const currentUser = await this.getCurrentUser();
      User.setConfig(currentUser, UserConfig.KeepPortrait, false);
      this.saveUser(currentUser);
    }
  }
}
