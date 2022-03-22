import { Injectable, OnDestroy } from '@angular/core';
import { ApplicationInsights, IExceptionTelemetry, IEventTelemetry } from '@microsoft/applicationinsights-web';
import { ActivatedRouteSnapshot, ResolveEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { ILogger } from '../interfaces/i-logger';

@Injectable({
  providedIn: 'root'
})
export class ApplicationInsightsService implements ILogger, OnDestroy {

  private routerSubscription: Subscription;
  private logs: string[] = [];
  private maxLogsLines = 1000;

  private appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: environment.instrumentationKey,
      enableCorsCorrelation: false,
    }
  });

  constructor(private router: Router) {
    const insight = this.appInsights.loadAppInsights();
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof ResolveEnd)).subscribe((event: ResolveEnd) => {
      const activatedComponent = this.getActivatedComponent(event.state.root);
      if (activatedComponent) {
        this.logPageView(`${activatedComponent.name} ${this.getRouteTemplate(event.state.root)}`, event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  public setUserId(userId: string): void {
    this.appInsights.setAuthenticatedUserContext(userId);
  }

  public clearUserId(): void {
    this.appInsights.clearAuthenticatedUserContext();
  }

  public logPageView(name?: string, uri?: string): void {
    this.appInsights.trackPageView({ name, uri });
  }


  /**
   * Logs into RAM to be displayed in the app
   */
  public logDebug(str1: string, str2: string = '', str3: string = '') {
    const result = str1 + ' ' + str2 + ' ' + str3;

    console.log(result);

    this.logs.push(result);

    if (this.logs.length === this.maxLogsLines) {
      this.logs.splice(0, this.maxLogsLines * 0.5);
      console.clear();
    }

    return;
  }

  public logEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    this.logs.push(name, JSON.stringify(properties));

    if (this.logs.length === this.maxLogsLines) {
      this.logs.splice(0, this.maxLogsLines * 0.5);
      console.clear();
    }

    const event: IEventTelemetry = {
      name, measurements, properties
    };
    try {
      this.appInsights.trackEvent(event, properties);
      this.appInsights.flush(false);
      // console.log('tracking event successful', event);
    } catch {
      // console.log('error tracking event');
    }
  }

  public logError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    this.logs.push(error.name + ' ' + error.message + ' ' + JSON.stringify(properties));

    if (this.logs.length === this.maxLogsLines) {
      this.logs.splice(0, this.maxLogsLines * 0.5);
      console.clear();
    }

    const exception: IExceptionTelemetry = {
      error, measurements, properties,
    };
    this.appInsights.trackException(exception);
    // console.log('Logged error : ', exception);
    console.error('Logged error2 : ', error);
  }

  public logConsole(name: string, properties?: { [key: string]: string; }, measurements?: { [key: string]: number; }) {
    console.log(name, properties, measurements);
  }

  private getActivatedComponent(snapshot: ActivatedRouteSnapshot): any {
    if (snapshot.firstChild) {
      return this.getActivatedComponent(snapshot.firstChild);
    }

    return snapshot.component;
  }

  private getRouteTemplate(snapshot: ActivatedRouteSnapshot): string {
    let path = '';
    if (snapshot.routeConfig) {
      path += snapshot.routeConfig.path;
    }

    if (snapshot.firstChild) {
      return path + this.getRouteTemplate(snapshot.firstChild);
    }

    return path;
  }

  public getDebugLogs(): string[] {
    return this.logs;
  }
}
