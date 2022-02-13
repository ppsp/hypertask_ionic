/*import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAuthenticationService } from 'src/app/interfaces/i-authentication-service';
//import { User as FireUser } from 'firebase';

@Injectable()
export class AuthenticationMockService implements IAuthenticationService {

  public currentUserIsAuthenticated(): Observable<boolean> {
    return of(true);
  }

  public logout(): Promise<void> {
    return;
  }

  public async getUserId(): Promise<string> {
    return 'testUserId';
  }

  public getUser(): Promise<FireUser> {
    return null;
  }

  public async setLoginPersistance(): Promise<void> {
    return;
  }

  public async getUserJsonWebToken(): Promise<string> {
    return '';
  }

  public async signInWithEmailPassword(email: string, password: string) {
    return;
  }

  public async createAccount(email: string, password: string): Promise<string> {
    return 'testUserId';
  }
}
*/