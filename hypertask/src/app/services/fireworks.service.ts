import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FireworksService {

  constructor() { }

  public async GenerateFireworks() {
    /*const fx = require('fireworks');*/
    // console.log('fireworks', fx);

    /*for (let i = 0 ; i < 10 ; i++) {
      fx.fireworks({
        x: (Math.random() * window.innerWidth) * 0.8 + window.innerWidth * 0.1,
        y: (Math.random() * window.innerHeight) * 0.8 + window.innerHeight * 0.1,
        colors: ['#4CAF50', '#2f80ed', '#D1D1D1'],
        count: 10
      });
      await ThreadUtils.sleep(200);
    }*/
  }
}
