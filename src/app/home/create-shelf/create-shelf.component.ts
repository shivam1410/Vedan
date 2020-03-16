
import { Component } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
    selector: 'create-shelf',
    templateUrl: `./create-shelf.component.html`,
    styleUrls: [`./create-shelf.component.scss`]
})
export class CreateShelfComponent {

    shelfName: string = '';
    constructor(
        private popoverController: PopoverController,
        public navParams:NavParams,
        private events: Events,
    ) {
        console.log("create shelf")
    }

    createShelf() {
        this.events.publish("shelfAdded");
        this.popoverController.dismiss(this.shelfName);
    }
    close(){
        this.popoverController.dismiss();
    }
}
