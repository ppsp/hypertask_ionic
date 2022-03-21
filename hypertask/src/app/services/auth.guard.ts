import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { IAuthenticationService } from '../interfaces/i-authentication-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: IAuthenticationService,
              private router: Router) {
  }

  public async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    const isLoggedIn = await this.auth.currentUserIsAuthenticated();

    if (isLoggedIn === true) {
      return true;
    } else {
      this.redirectToLogin();
      return false;
    }
  }

  private redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
