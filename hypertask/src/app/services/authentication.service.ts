import { Injectable } from '@angular/core';
import { ILogger } from '../interfaces/i-logger';
import { IAuthenticationService } from '../interfaces/i-authentication-service';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements IAuthenticationService {

  //private isAuthenticated: boolean = false;

  constructor(private logger: ILogger,
              private auth: AngularFireAuth) {
    /*auth.onAuthStateChanged(user => {
      if (user) {
        this.isAuthenticated = true;
        console.log('USER IS SIGNED IN');
      } else {
        this.isAuthenticated = false;
        console.log('USER IS NOT SIGNED IN');
      }
    });*/
  }

  public async currentUserIsAuthenticated(): Promise<boolean> {
    const user = await this.auth.authState.pipe(first()).toPromise();;
    if (user) {
      //console.log('USER IS AUTHENTICATED');
      return true;
    } else {
      //console.log('USER IS NOT AUTHENTICATED');
      return false;
    }
  }

  public async getUserId(): Promise<string> {
    //console.log('getUserId string');
    const user = await this.getUser();
    //console.log('getUserId got user', user);
    if (user == null) {
      return null;
    } else {
      //console.log('RETURNING USER ID : ', user.uid);
      return user.uid;
    }
  }

  public getUser(): Promise<User> { //todo capacitor
    /*console.log('GETTING USER GETUSER()');
    console.log('current user : ', this.auth.currentUser);
    console.log('current user : ', this.auth.user);*/
    //return this.auth.currentUser;
    return this.auth.authState.pipe(first()).toPromise();
  }

  public async setLoginPersistance(): Promise<void> {
    try {
      //console.log('PERSISTANCE SET BEFORE');
      await this.auth.setPersistence('local');
      //console.log('PERSISTANCE SET AFTER');
    } catch (error) {
      //console.log('ERROR PERSISTANCE', error)
      this.logger.logError(error);
    }
  }

  public async getUserJsonWebToken(): Promise<string> {
    const token = await (await this.auth.currentUser).getIdToken();
    return token;
  }

  public async signInWithEmailPassword(email: string,
                                       password: string) {
    try {
      const response = await this.auth.signInWithEmailAndPassword(email, password);
      return response;
    } catch (error) {
      this.logger.logError(error);
    }
  }

  public async createAccount(email: string,
                             password: string): Promise<string> {
    try {
      const response = await this.auth.createUserWithEmailAndPassword(email, password);
      return response.user.uid;
    } catch (error) {
      this.logger.logError(error);
    }
  }

  public async logout(): Promise<void> {
    //console.log('LOGOUT');
    await this.auth.signOut();
    return;
  }
}
