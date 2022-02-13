import { Injectable } from '@angular/core';
import { ILogger } from '../../interfaces/i-logger';

@Injectable()
export class MockLogger implements ILogger {
  constructor() {}

  public setUserId(userId: string): void {
    return;
  }

  public clearUserId(): void {
    return;
  }

  public logPageView(name?: string, uri?: string): void {
    return;
  }

  public logConsole(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    return;
  }

  public logEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    return;
  }

  public logError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    return;
  }

  public logDebug(str1: string, str2: string, str3: string) {
    return;
  }

  public getDebugLogs(): string[] {
    return [];
  }
}
