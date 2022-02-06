import { Language } from './language.enum';

export class UserConfig {

  public static PreferedLanguageKey: string = 'PreferedLanguage';
  public static DefaultNonRecurringAfterTaskNameKey: string = 'DefaultNonRecurringAfterTaskNameKey';
  public static DefaultRecurringAfterTaskNameKey: string = 'DefaultRecurringAfterTaskNameKey';
  public static EndOfDayTimeKey: string = 'EndOfDayTime';
  public static EnableCloudSyncKey: string = 'EnableCloudSync';
  public static DefaultRecurringGroupId: string = 'DefaultRecurringGroupId';
  public static DefaultNonRecurringGroupId: string = 'DefaultNonRecurringGroupId';
  public static AutoSkipAfter2DaysId: string = 'AutoSkipAfter2Days';
  public static AutoSkipAfter2DaysLastSkipDateId: string = 'AutoSkipAfter2DaysLastSkipDateId';
  public static KeepPortrait: string = 'KeepPortrait';

  public Configs: Map<string, any>;

  constructor() {
    this.Configs = new Map<string, any>();
    this.Configs.set(UserConfig.PreferedLanguageKey, Language.English);
    this.Configs.set(UserConfig.EndOfDayTimeKey, '04:00');
    this.Configs.set(UserConfig.EnableCloudSyncKey, false);
    this.Configs.set(UserConfig.AutoSkipAfter2DaysId, true);
  }

  public static getHourValues(config: UserConfig): number[] {
    // TODO: This needs to be cached but also reloaded on change
    const firstHour = Number(config.Configs.get(UserConfig.EndOfDayTimeKey).substring(0, 2));

    const result: number[] = [];
    for (let i = 0; i < 24; i++) {
      const hourIterator = (firstHour + i) % 24;
      result.push(hourIterator);
    }

    return result;
  }

  public static getMinutesValues(): number[] {
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }
}
