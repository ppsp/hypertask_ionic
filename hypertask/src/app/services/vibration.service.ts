import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VibrationService {

  /**
   * For now the functionality is disabled, include it in a future update
   */
  constructor(/*private vibration: Vibration*/) { }

  public vibrate(milliseconds: number) {
    return;
  }
}
