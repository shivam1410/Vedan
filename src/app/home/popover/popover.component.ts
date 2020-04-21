
import { Component } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss']
})
export class PopoverComponent {
    nightmode:boolean;
    hideDirectoryBool:boolean;
    type;
    editFile;
    constructor(
        private popoverController: PopoverController,
        public navParams:NavParams,
        private events: Events,
    ) {
        this.nightmode = this.navParams.get('nightmode');   
        this.hideDirectoryBool = this.navParams.get('hideDirectoryBool');
        this.type = this.navParams.get('type');
    }

    move(){
        this.popoverController.dismiss('move');
    }

    rename(){
        this.popoverController.dismiss('rename')
    }

    delete(){
        this.popoverController.dismiss('delete')
    }

    changeFontSize(str){
        this.events.publish('fontchanged');
        this.popoverController.dismiss(str);
    }

    changenighMode(nightmode){
        this.events.publish('nightmodechanged');
        this.popoverController.dismiss(nightmode);
    }

    hideDirectory(hideDirectoryBool){
        this.events.publish('hiddenStateChanged');
        this.popoverController.dismiss(hideDirectoryBool);
    }

    createshelf(){
        this.events.publish("createNewShelf");
        this.popoverController.dismiss();
    }
}
