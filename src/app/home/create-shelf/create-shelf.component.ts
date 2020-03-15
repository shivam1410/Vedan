
import { Component } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
    selector: 'create-shelf',
    template: `
    <ion-list>
        <ion-item>
            <ion-label> Name of Shelf</ion-label>
        </ion-item>
        <ion-item>
            <ion-input [(ngModel)]="shelfName"></ion-input>
        </ion-item>
        <ion-button (click)="createShelf()">Add</ion-button>
    </ion-list>`
})
export class CreateShelfComponent {
    shelfName: string;
    constructor(
        private popoverController: PopoverController,
        public navParams:NavParams,
        private events: Events,
    ) {}

    createShelf() {
        this.events.publish("shelfAdded");
        this.popoverController.dismiss(this.shelfName);
    }
}
