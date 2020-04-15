import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  constructor(
    private toast: ToastController
  ) { }

  async show(str){
    const toast = await this.toast.create({
      message: str,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }
}
