import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Injectable({
  providedIn: 'root'
})
export class NightmodeService {

  nightmode:Boolean;
  constructor(
    private statusBar: StatusBar,
  ) { }

  toggleDarkMode(night){
    this.nightmode = night
    if(night){
      document.body.setAttribute('data-theme', 'dark');
      this.statusBar.backgroundColorByHexString('#121212');
    }
    else{
      document.body.setAttribute('data-theme', 'light');
      this.statusBar.backgroundColorByHexString('##311b92');

    }
  }
  checkMode(){
    return this.nightmode;
  }
}