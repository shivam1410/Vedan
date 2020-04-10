
import { Component } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
    selector: 'create-shelf',
    templateUrl: `./create-shelf.component.html`,
    styleUrls: [`./create-shelf.component.scss`]
})
export class CreateShelfComponent {

    shelfName: string = '';
    ren: boolean;
    constructor(
        private popoverController: PopoverController,
        public navParams:NavParams,
        private events: Events,
    ) {
        this.shelfName = this.navParams.get("filename")
        this.ren = this.navParams.get("rename")
    }

    rename(){
        this.popoverController.dismiss(this.shelfName);
    }
    createShelf() {
        this.events.publish("shelfAdded");
        this.popoverController.dismiss(this.shelfName);
    }
    close(){
        this.popoverController.dismiss();
    }
}
