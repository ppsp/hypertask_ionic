import { Injectable } from '@angular/core';
//import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import DateUtils from '../shared/date-utils';
import { TranslateService } from '@ngx-translate/core';
import { CalendarTaskService } from './calendar-task.service';
import { DateService } from './date.service';
import { TimerService } from './timer.service';
import { EventService } from './event.service';
import { ILogger } from '../interfaces/i-logger';
import { LocalNotificationsPlugin } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSynced: boolean = false;

  constructor(/*private localNotifications: LocalNotifications,*/
              private translate: TranslateService,
              private logger: ILogger,
              private calendarTaskService: CalendarTaskService,
              private dateService: DateService,
              private timerService: TimerService,
              private localNotifications: LocalNotificationsPlugin,
              private eventService: EventService) {
    this.eventService.on(EventService.EventIds.NotificationSyncedFalse, () => {
      this.notificationsSynced = false;
    });
  }

  public async cancelTodayNotification(name: string, notificationId: number) {
    try {
      /*this.logger.logEvent('CANCEL TODAY NOTIFICATION ID = ',
      {
        key: 'name',
        value: name
      });*/
      // this.logger.logDebug('CANCEL TODAY NOTIFICATION ID = ', name, String(notificationId));
      const todayWorkDate = this.dateService.GetTodayWorkDate();
      const scheduled = await this.localNotifications.getPending();
      // this.logger.logDebug('NOTIFICATIONS STILL SCHEDULED 1', JSON.stringify(scheduled.map(p => p.text)));
      for (const notif of scheduled.notifications) {
        // this.logger.logDebug('NOTIFICATION AT? : ', String(notif.trigger.at));
        if ((notif.id === notificationId ||
            notif.id === notificationId + 1000000 ||
            notif.id === notificationId + 2000000) &&
            DateUtils.datesAreEqual(new Date(notif.schedule.at), todayWorkDate)) {
            await this.localNotifications.cancel({
              notifications: [{ id: notif.id }],
            });
          // this.logger.logDebug('NOTIFICATION TODAY CANCELLED ID : ', name, String(notif.id));
        } /*else {
          this.logger.logDebug('NOTIFICATION TODAY NOT CANCELLED ID : ', String(notif.id));
        }*/
      }

      // this.logger.logDebug('TODAY NOTIFICATION CANCELLED ID = ', name, String(notificationId));
    } catch (error) {
      if (String(error)) {
        return;
      }
      // console.log('Error cancelTodayNotification', error);
      this.logger.logError(error);
    }
  }

  public async cancelAllNotification(notificationId: number) {
    try {
      /*this.logger.logEvent('CANCEL all notifications',
      {
        key: 'notificationId',
        value: String(notificationId)
      });*/

      // this.logger.logDebug('CANCEL ALL NOTIFICATIONS', String(notificationId));
      const scheduled = await this.localNotifications.getPending();

      for (const notif of scheduled.notifications) {
        if (notif.id === notificationId ||
            notif.id === notificationId + 1000000 ||
            notif.id === notificationId + 2000000) {
          await this.localNotifications.cancel({
            notifications: [{ id: notif.id }],
          });
        }

        // this.logger.logDebug('NOTIFICATION CANCELLED ID : ', String(notif.id));
      }
    } catch (error) {
      // console.log('ERROR CANCELLING NOTIFICATIONS', error);
      this.logger.logDebug('ERROR CANCELLING NOTIFICATIONS ' + notificationId, String(error));
      this.logger.logError(error);
    }
  }

  public async resetAllNotifications() {
    // TODO: This might not be thread safe
    try {
      this.logger.logEvent('resetAllNotifications');
      var allNotifications = await this.localNotifications.getPending();

      await this.localNotifications.cancel({ notifications: allNotifications.notifications });
      this.notificationsSynced = false;
      await this.refreshNotifications();
    } catch (error) {
      // console.log('ERROR resetAllNotifications', error);
      this.logger.logError(error);
    }
  }

  public async refreshNotifications() {
    if (this.notificationsSynced === true) {
      return;
    }

    // this.logger.logDebug('REFRESHING NOTIFICATIONS');
    // this.logger.logEvent('REFRESHING NOTIFICATIONS');

    try {
      const todayWorkDate = this.dateService.GetTodayWorkDate();

      // this.logger.logDebug('REFRESHING NOTIFICATIONS 1');

      for (const task of this.calendarTaskService.getAllTasks()) {
        if (task.Name.includes('Carl') || task.Name.includes('Carl')) {
          console.log('TASK FROUND :', task);
        }

        if (task.NotificationId != null &&
            task.NotificationTime != null) {

          // this.logger.logDebug('REFRESHING NOTIFICATIONS ID = ' + task.NotificationId);
          const timer = await this.timerService.getTimer(todayWorkDate, task.CalendarTaskId);
          // VOID -> CANCEL ALL NOTIFICATIONS
          if (task.Void === true) {
            this.logger.logEvent('CANCEL TODAY NOTIFICATION (VOID)', { key: 'taskName', value: task.Name});
            // this.logger.logDebug('CANCEL ALL NOTIFICATION 1', task.Name);
            await this.cancelAllNotification(task.NotificationId);
          } else if (this.calendarTaskService.isDoneOrSkipped(task, todayWorkDate) ||
                     (timer != null && timer.isStarted === true)) { // TODO : Might not be efficient
            this.logger.logEvent('CANCEL TODAY NOTIFICATION 1', { key: 'taskName', value: task.Name});
            // this.logger.logDebug('CANCEL TODAY NOTIFICATION 1', task.Name, String(task.NotificationId));
            await this.cancelTodayNotification(task.Name, task.NotificationId);
          } else {
            const nextNotification = new Date(DateUtils.getLocalMysqlDateString(new Date()).substring(0, 10) +
                                                                                ' ' +
                                                                                task.NotificationTime +
                                                                                ':00');
            var allNotifications = (await this.localNotifications.getPending()).notifications;

            const notification = allNotifications.find(p => p.id == notification.notificationId);
            /*try {
              this.logger.logDebug('GETTING NOTIFICATION', JSON.stringify(notification));
              this.logger.logDebug('GETTING NOTIFICATION', JSON.stringify(notification.text));
            } catch (Error) {
              this.logger.logDebug('ERROR', String(Error));
            }*/

            // this.logger.logDebug('REFRESHING NOTIFICATIONS 3');

            // If notification is in the future
            if (nextNotification.getTime() > new Date().getTime() &&
                notification.text == null) {
              this.logger.logEvent('ADDING NOTIFICATION', { key: 'taskName', value: task.Name});
              // this.logger.logDebug('ADDING NOTIFICATION', task.Name, String(task.NotificationId));
              // this.logger.logDebug('NEXT NOTIFICATION', nextNotification.toISOString());
              // this.logger.logDebug('CURRENT_TIME', new Date().toISOString());

              // Schedule delayed notifications 3 days in advance
              var result = await this.localNotifications.schedule({
                notifications: [
                  {
                    title: this.translate.instant('notification.lbl-inactivity-title'),
                    body: this.translate.instant('notification.lbl-inactivity-msg', {task: task.Name}),
                    id: task.NotificationId,
                    schedule: {
                      at: nextNotification,
                      repeats: false,
                    },
                    actionTypeId: '', 
                    extra: null,
                  },
                ],
              });
                               
                //id: task.NotificationId,
                //title: this.translate.instant('notification.lbl-inactivity-title'),
                //text: this.translate.instant('notification.lbl-inactivity-msg', {task: task.Name}),
                //trigger: {at: nextNotification},
                //led: 'FF0000',
                //sound: null,
                //icon: 'res://notification_icon.png',
                //color: '3976F2',
                //vibrate: true,
            }
          }
        }
      }

      this.notificationsSynced = true;

      // this.logger.logDebug('REFRESHED NOTIFICATIONS DONE');
    } catch (error) {
      if (String(error) == null) {
        return;
      }
      // console.log('ERROR refreshing', error);
      this.logger.logDebug('ERROR REFRESHING', String(error));
      this.logger.logError(error);
    }
  }
}
