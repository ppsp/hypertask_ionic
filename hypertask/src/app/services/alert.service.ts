import { Injectable } from '@angular/core';
import { AlertOptions } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import DateUtils from '../shared/date-utils';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private translate: TranslateService) { }

  public getDurationAlertOptions(handler: (alertData: any) => void,
                                 hours: number,
                                 minutes: number,
                                 seconds: number): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-enter-duration'),
      backdropDismiss: false,
      inputs: [
        {
          name: 'Hours',
          type: 'number',
          placeholder: hours === 0 ? this.translate.instant('alert.lbl-hours') : String(hours),
          min: '0',
          max: '24',
        },
        {
          name: 'Minutes',
          type: 'number',
          placeholder: minutes === 0 ? this.translate.instant('alert.lbl-minutes') : String(minutes),
          min: '0',
          max: '60',
        },
        {
          name: 'Seconds',
          type: 'number',
          placeholder: seconds === 0 ? this.translate.instant('alert.lbl-seconds') : String(seconds),
          min: '0',
          max: '60',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: this.translate.instant('alert.lbl-ok'),
          handler
        }
      ],
      cssClass: 'alert-top'
    };

    return options;
  }

  public getDecimalAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-enter-value'),
      backdropDismiss: false,
      inputs: [
        {
          name: 'Value',
          type: 'number',
          placeholder: this.translate.instant('alert.placeholder-enter-value')
        }
      ],
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: this.translate.instant('alert.lbl-ok'),
          handler
        }
      ],
      cssClass: 'alert-top'
    };

    return options;
  }

  public getNoteAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-note'),
      backdropDismiss: false,
      inputs: [
        {
          name: 'Value',
          type: 'text',
          placeholder: this.translate.instant('alert.placeholder-note')
        }
      ],
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: this.translate.instant('alert.lbl-ok'),
          handler
        }
      ],
      cssClass: 'alert-top'
    };

    return options;
  }

  public getVoidAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.msg-confirmation'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          role: 'Cancel'
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        },
      ]
    };

    return options;
  }

  public getCancelTimerAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.msg-confirmation'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          role: 'Cancel'
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        },
      ]
    };

    return options;
  }

  public getDeleteNoteAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.msg-confirmation'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          role: 'Cancel'
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        },
      ]
    };

    return options;
  }

  public getDeleteTaskAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-confirmation-delete'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        }
      ]
    };

    return options;
  }

  public getDeleteAccountAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-confirmation-delete-account'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        }
      ]
    };

    return options;
  }

  public getDeleteGroupAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-confirmation-delete-group'),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        }
      ]
    };

    return options;
  }

  public getTimerExpiredAlertOptions(handlerCancel: (alertData: any) => void,
                                     handlerOk: (alertData: any) => void,
                                     seconds: number,
                                     taskName: string): AlertOptions {
    const durationString = DateUtils.getDurationString(seconds);
    const alertMsg = this.translate.instant('alert.msg-timer-expired') + '<br/><br/>' + taskName + '<br/>' + durationString;

    const options: AlertOptions = {
      message: alertMsg,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
          handler: handlerCancel
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler: handlerOk
        }
      ]
    };

    return options;
  }

  public getEditNoteAlertOptions(handler: (alertData: any) => void, text: string): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-confirmation-edit-note'),
      backdropDismiss: false,
      inputs: [
        {
          name: 'Note',
          type: 'text',
          value: text
        },
      ],
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
        },
        {
          text: this.translate.instant('alert.btn-save'),
          handler
        }
      ]
    };

    return options;
  }

  public getBugReportAlertOptions(handler: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: this.translate.instant('alert.msg-thanks'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'Cancel'
        },
        {
          text: this.translate.instant('alert.lbl-send'),
          handler
        }
      ],
      inputs: [
        {
          name: 'Title',
          type: 'text',
          placeholder: this.translate.instant('alert.placeholder-title'),
        },
        {
          name: 'Description',
          type: 'text',
          placeholder: this.translate.instant('alert.placeholder-description'),
        },
      ],
    };

    return options;
  }

  public getCloseTaskEditPopupAlertOptions(handlerYes: (alertData: any) => void,
                                           handlerNo: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-save-confirmation'),
        buttons: [
          {
            text: this.translate.instant('alert.lbl-no'),
            handler: handlerNo
          },
          {
            text: this.translate.instant('alert.lbl-yes'),
            handler: handlerYes
          }
        ]
    };

    return options;
  }

  public getConfirmationAlertOptions(headerTxt: string,
                                     handlerYes: (alertData: any) => void,
                                     handlerNo: (alertData: any) => void): AlertOptions {
    const options: AlertOptions = {
      header: headerTxt,
      buttons: [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: handlerNo
        }, {
          text: this.translate.instant('alert.lbl-ok'),
          handler: handlerYes
        }
      ]
    };

    return options;
  }

  public getChangeDefaultAlertOptions(handlerOk: (alertData: any) => void,
                                      handlerCancel: (alertData: any) => void,
                                      handlerSetAsDefault: (alertData: any) => void,
                                      handlerSetAsFirst: (alertData: any) => void,
                                      choices: string[],
                                      selected: string): AlertOptions {
    let buttons = [
      {
        text: this.translate.instant('alert.lbl-default'),
        handler: handlerSetAsDefault
      },
      {
        text: this.translate.instant('alert.lbl-first'),
        handler: handlerSetAsFirst
      },
      {
        text: this.translate.instant('alert.lbl-cancel'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: handlerCancel
      },
      {
        text: this.translate.instant('alert.lbl-ok'),
        handler: handlerOk
      },
    ];

    if (handlerSetAsDefault == null) {
      buttons = [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: handlerCancel
        },
        {
          text: this.translate.instant('alert.lbl-ok'),
          handler: handlerOk
        }
      ];
    }

    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-after') + ' :',
      backdropDismiss: false,
      buttons,
      inputs: [],
      cssClass: 'alert-top'
    };

    for (const choice of choices) {
      options.inputs.push({
        type: 'radio',
        label: choice,
        value: choice,
        checked: choice === selected
      });
    }

    return options;
  }

  public getChangeResultTypeOptions(handlerOk: (alertData: any) => void,
                                    handlerCancel: (alertData: any) => void,
                                    // handlerSetAsDefault: (alertData: any) => void,
                                    choices: string[],
                                    selected: string): AlertOptions {
    const buttons = [
      /*{
        text: this.translate.instant('alert.lbl-default'),
        handler: handlerSetAsDefault
      },*/
      {
        text: this.translate.instant('alert.lbl-cancel'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: handlerCancel
      },
      {
        text: this.translate.instant('alert.lbl-ok'),
        handler: handlerOk
      },
    ];

    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-result-type') + ' :',
      backdropDismiss: false,
      buttons,
      inputs: [],
      cssClass: 'alert-top'
    };

    for (const choice of choices) {
      options.inputs.push({
        type: 'radio',
        label: choice,
        value: choice,
        checked: choice === selected
      });
    }

    return options;
  }


  public getChangeDefaultGroupAlertOptions(handlerOk: (alertData: any) => void,
                                           handlerCancel: (alertData: any) => void,
                                           handlerSetAsDefault: (alertData: any) => void,
                                           handlerNew: (alertData: any) => void,
                                           choices: string[],
                                           selected: string): AlertOptions {
    let buttons = [
      {
        text: this.translate.instant('alert.lbl-default'),
        handler: handlerSetAsDefault
      },
      {
        text: this.translate.instant('alert.lbl-create-new'),
        cssClass: 'secondary',
        handler: handlerNew
      },
      {
        text: this.translate.instant('alert.lbl-cancel'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: handlerCancel
      },
      {
        text: this.translate.instant('alert.lbl-ok'),
        handler: handlerOk
      },
    ];

    if (handlerSetAsDefault == null) {
      buttons = [
        {
          text: this.translate.instant('alert.lbl-cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: handlerCancel
        },
        {
          text: this.translate.instant('alert.lbl-ok'),
          handler: handlerOk
        }
      ];
    }

    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-group') + ' :',
      backdropDismiss: false,
      buttons,
      inputs: [],
      cssClass: 'alert-top'
    };

    for (const choice of choices) {
      options.inputs.push({
        type: 'radio',
        label: choice,
        value: choice,
        checked: choice === selected
      });
    }

    return options;
  }

  public getChangeGroupPositionAlertOptions(handlerOk: (alertData: any) => void,
                                            handlerCancel: (alertData: any) => void,
                                            handlerSetAsFirst: (alertData: any) => void,
                                            choices: string[],
                                            selected: string): AlertOptions {
    const buttons = [
      {
        text: this.translate.instant('alert.lbl-first'),
        handler: handlerSetAsFirst
      },
      {
        text: this.translate.instant('alert.lbl-cancel'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: handlerCancel
      },
      {
        text: this.translate.instant('alert.lbl-ok'),
        handler: handlerOk
      },
    ];

    const options: AlertOptions = {
      header: this.translate.instant('alert.lbl-after') + ' :',
      backdropDismiss: false,
      buttons,
      inputs: []
    };

    for (const choice of choices) {
      options.inputs.push({
        type: 'radio',
        label: choice,
        value: choice,
        checked: choice === selected
      });
    }

    return options;
  }

  public getConfirmChangeGroupAlertOptions(handler: (alertData: any) => void,
                                           groupName: string): AlertOptions {
    const options: AlertOptions = {
      message: this.translate.instant('alert.msg-confirmation-change-group', {groupName}),
      buttons: [
        {
          text: this.translate.instant('alert.lbl-no'),
        },
        {
          text: this.translate.instant('alert.lbl-yes'),
          handler
        }
      ]
    };

    return options;
  }
}
