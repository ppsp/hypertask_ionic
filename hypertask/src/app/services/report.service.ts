import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { IApiProvider } from '../interfaces/i-api-provider';
import { ILogger } from '../interfaces/i-logger';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private api: IApiProvider,
              private alert: AlertController,
              private translate: TranslateService,
              private logger: ILogger) { }

  public async getAllData() {
    try {
      const filePath = await this.api.downloadAllData(UserService.currentUserId);

      if (filePath.length > 0) {
        const alert = await this.alert.create({message: this.translate.instant('alert.data-downloaded-success') + filePath});

        alert.present();
      } else {
        await this.showError();
      }
    } catch (error) {
      this.logger.logError(error);
      await this.showError();
    }
  }

  private async showError() {
    const alert = await this.alert.create({ message: this.translate.instant('alert.data-downloaded-error') });

    alert.present();
  }
}
