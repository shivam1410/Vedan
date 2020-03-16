
import { Component } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss']
})
export class PopoverComponent {
    nightmode:boolean;
    constructor(
        private popoverController: PopoverController,
        public navParams:NavParams,
        private events: Events,
    ) {
        console.log("popover constructor called")
        this.nightmode = this.navParams.get('nightmode');   
        console.log("arrival", this.nightmode)
    }

    changeFontSize(str){
        console.log(str);
        this.events.publish('fontchanged');
        this.popoverController.dismiss(str);
    }

    changenighMode(nightmode){
        console.log(this.nightmode);
        this.events.publish('nightmodechanged');
        this.popoverController.dismiss(nightmode);
    }

    createshelf(){
        this.events.publish("createNewShelf");
        this.popoverController.dismiss();
    }
}
