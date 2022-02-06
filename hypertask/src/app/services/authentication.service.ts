import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ILogger } from '../interfaces/i-logger';
import { IAuthenticationService } from '../interfaces/i-authentication-service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements IAuthenticationService {

  constructor(private logger: ILogger) {}

  public currentUserIsAuthenticated(): Observable<boolean> {
    /*return this.auth.authState.pipe(map(User => {
      if (User) {
        return true;
      } else {
        return false;
      }
    }));*/
    return false;
  }

  public logout(): Promise<void> {
    //return this.auth.auth.signOut();
    return;
  }

  public async getUserId(): Promise<string> {
    const user = await this.getUser();
    if (user == null) {
      return null;
    } else {
      return user.uid;
    }
  }

  public getUser(): Promise<firebase.User> {
    //return this.auth.authState.pipe(first()).toPromise();
    return null;
  }

  public async setLoginPersistance(): Promise<void> {
    try {
      //await this.auth.auth.setPersistence('local');
    } catch (error) {
      this.logger.logError(error);
    }
  }

  public async getUserJsonWebToken(): Promise<string> {
    /*const user = await this.auth.authState.pipe(take(1)).toPromise();
    return user.getIdToken();*/
    return "";
  }

  public async signInWithEmailPassword(email: string,
                                       password: string) {
    try {
      //const response = await this.auth.auth.signInWithEmailAndPassword(email, password);
      return;
    } catch (error) {
      this.logger.logError(error);
    }
  }

  public async createAccount(email: string,
                             password: string): Promise<string> {
    try {
      //const response = await this.auth.auth.createUserWithEmailAndPassword(email, password);
      //return response.user.uid;
      return "";
    } catch (error) {
      this.logger.logError(error);
    }
  }
}
