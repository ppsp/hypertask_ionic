import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Network } from '@capacitor/network';

export enum ConnectionStatus {
  Online,
  Offline
}

/**
 * Source : https://devdactic.com/ionic-4-offline-mode/
 * Credits : Steve
 */

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {

  //private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);
  private connectSubscription: Subscription;
  private disconnectSubscription: Subscription;

  constructor(private plt: Platform) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      /*Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status);
      });*/
      //const status = (await Network.getStatus()) == ConnectionStatus.Online : ConnectionStatus.Offline;
      //this.status.next(status);
    });
  }

  ngOnDestroy() {
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }

  public initializeNetworkEvents() {
    /*this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        // console.log('WE ARE OFFLINE');
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        // console.log('WE ARE ONLINE');
        this.updateNetworkStatus(ConnectionStatus.Online);
      }
    });*/
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    //this.status.next(status);
    const connection = status === ConnectionStatus.Offline ? 'Offline' : 'Online';
    // console.log('connection status = ', connection);
  }

  /*public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }*/

  public async getCurrentNetworkStatus(): Promise<ConnectionStatus> {
    console.log('GETTING CURRENT NETWORK STATUS');
    //return this.status.getValue();
    var status = await Network.getStatus();
    if (status.connected === true) {
      console.log('ONELINE');
      return ConnectionStatus.Online;
    } else {
      console.log('OFFLINE', status);
      return 
    }
  }
}
