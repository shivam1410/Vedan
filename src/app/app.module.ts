import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { WebServer } from '@ionic-native/web-server/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


//hammerjs
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { ToastrService } from './service/toastr.service';
import { AlertService } from './service/alert.service';
import { FirebaseSer } from './service/firebase.service';

import { AngularFireModule } from 'angularfire2';
import { AngularFireStorageModule,
  AngularFireStorageReference,
  AngularFireUploadTask,
  StorageBucket} from 'angularfire2/storage';

import * as firebase from 'firebase/app';

firebase.initializeApp(environment.firebase);

import { environment } from 'src/environments/environment';

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
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ToastrService,
    AlertService,
    NavigationBar,
    AndroidPermissions,
    WebServer,
    FirebaseSer,
    { provide: StorageBucket, useValue: "your" },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy,  },
    {provide: HAMMER_GESTURE_CONFIG,useClass: HammerConfig}  ],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
