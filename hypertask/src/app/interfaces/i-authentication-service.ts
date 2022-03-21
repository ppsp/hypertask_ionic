import { User } from '@angular/fire/auth';

export abstract class IAuthenticationService {
  abstract currentUserIsAuthenticated(): Promise<boolean>;
  abstract logout(): Promise<void>;
  abstract getUserId(): Promise<string>;
  abstract getUser(): Promise<User>;//abstract getUser(): Promise<firebase.User>;
  abstract setLoginPersistance(): Promise<void>;
  abstract getUserJsonWebToken(): Promise<string>;
  abstract signInWithEmailPassword(email: string, password: string);
  abstract createAccount(email: string, password: string): Promise<string>;
}
