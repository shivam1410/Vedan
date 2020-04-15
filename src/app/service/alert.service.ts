import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alertctrl: AlertController
  ) { }

  async show(header,message,buttons){
    const alert = await this.alertctrl.create({
     header: header,
     message: message,
     buttons: buttons
   });

   await alert.present();
  }
}
