import { UserConfig } from '../Core/user-config';

export class DTOUserConfig {

  public Configs: KeyValuePair[];

  constructor() {
    this.Configs = [];
  }

  public static FromUserConfig(userConfig: UserConfig): DTOUserConfig {
    const dto = new DTOUserConfig();
    for (const config of userConfig.Configs) {
      const keyValuePair = new KeyValuePair();
      keyValuePair.key = config[0];
      keyValuePair.value = config[1];

      dto.Configs.push(keyValuePair);
    }
    return dto;
  }

  public static ToUserConfig(userConfig: DTOUserConfig): UserConfig {
    const newUser = new UserConfig();
    for (const keyValuePair of userConfig.Configs) {
      newUser.Configs.set(keyValuePair.key, keyValuePair.value);
    }
    return newUser;
  }
}

export class KeyValuePair {
  public key: string;
  public value: any;
}
