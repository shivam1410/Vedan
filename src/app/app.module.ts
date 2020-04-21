import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';


//hammerjs
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { ToastrService } from './service/toastr.service';
import { AlertService } from './service/alert.service';

export class HammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    let mc = new Hammer(element, {
      touchAction: "auto",
    });
    mc.get("pan").set({
      direction: Hammer.DIRECTION_ALL
    })
    mc.get("swipe").set({ 
      direction: Hammer.DIRECTION_ALL,
      enable: true
    })
    mc.get("press").set({time:500})
    return mc;
  }
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    ToastrService,
    AlertService,
    NavigationBar,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HAMMER_GESTURE_CONFIG,useClass: HammerConfig}  ],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
