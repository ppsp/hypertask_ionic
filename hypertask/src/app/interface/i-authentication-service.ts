import { Observable } from 'rxjs';

export abstract class IAuthenticationService {
  abstract currentUserIsAuthenticated(): Observable<boolean>;
  abstract logout(): Promise<void>;
  abstract getUserId(): Promise<string>;
  abstract getUser(): Promise<firebase.User>;
  abstract setLoginPersistance(): Promise<void>;
  abstract getUserJsonWebToken(): Promise<string>;
  abstract signInWithEmailPassword(email: string, password: string);
  abstract createAccount(email: string, password: string): Promise<string>;
}
