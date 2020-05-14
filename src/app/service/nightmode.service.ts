import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Injectable({
  providedIn: 'root'
})
export class NightmodeService {

  nightmode:boolean;
  constructor(
    private statusBar: StatusBar,
  ) { }

  toggleDarkMode(night:boolean){
    console.log(night)
    this.nightmode = night
    if(night){
      document.body.setAttribute('data-theme', 'dark');
      this.statusBar.backgroundColorByHexString('#121212');
      localStorage.setItem("dark","true")
    }
    else{
      document.body.setAttribute('data-theme', 'light');
      this.statusBar.backgroundColorByHexString('#311b92');
      localStorage.setItem("dark","false")
    }
  }
  checkMode(){
    return this.nightmode;
  }
}