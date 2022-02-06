export abstract class ILogger {
  abstract setUserId(userId: string): void;
  abstract clearUserId(): void;
  abstract logPageView(name?: string, uri?: string): void;
  abstract logConsole(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number });
  abstract logEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number });
  abstract logError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number });
  abstract logDebug(str1: string, str2?: string, str3?: string);
  abstract getDebugLogs(): string[];
}
