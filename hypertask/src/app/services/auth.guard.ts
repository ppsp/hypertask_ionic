import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
//import { triggerAsyncId } from 'async_hooks';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAuthenticationService } from '../interfaces/i-authentication-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: IAuthenticationService,
              private router: Router) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return true;
    /*return this.auth.currentUserIsAuthenticated().pipe(map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        this.redirectToLogin();
        return false;
      }
    }));*/
  }

  private redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
