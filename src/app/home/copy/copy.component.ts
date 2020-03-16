import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { Events, NavParams, PopoverController} from '@ionic/angular'

@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
})
export class CopyComponent {

  folder = '';
  directories = [];
  items = [];
  copyfile;
  copyPath="";
  shouldmove:boolean;
  baseFS= '';
  constructor(
    private file: File,
    public navParams:NavParams,
    private popovercontroller:PopoverController,
    private events: Events,

  ) {
        this.baseFS = this.navParams.get("baseFS");
        this.folder = "Books";
        this.listDir();
   }

    listDir = () => {
    this.items = [];
    this.file.listDir(this.baseFS, this.folder).then(entries => {
      entries.forEach(r=>{
        if(r.isDirectory){
          this.items.push(r);
        }
      })
      this.items.sort((a,b)=> b.isDirectory - a.isDirectory)
    })
  }


  itemClicked(file: Entry) {
    let path = this.folder != '' ? this.folder + '/' + file.name : file.name;
    let folder =  encodeURIComponent(path);
    this.folder = path;

    this.listDir();
  }

  finishCopyFile(){
    const path = this.baseFS + this.folder + '/';
    this.events.publish("filecopied");
    this.popovercontroller.dismiss(path);
  }

  close(){
    this.popovercontroller.dismiss();
  }
}
