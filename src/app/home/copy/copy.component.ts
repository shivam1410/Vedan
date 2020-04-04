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
  folderStack :string[] = [];

  directories = [];
  items = [];
  copyfile;
  copyPath="";
  shouldmove:boolean;
  shouldImport : boolean = false;
  baseFS= '';
  selectedFilesMap = {};
  selectAllItems = false;
  constructor(
    private file: File,
    public navParams:NavParams,
    private popovercontroller:PopoverController,
    private events: Events,

  ) {
        this.shouldmove = this.navParams.get("shouldmove");
        this.shouldImport = this.navParams.get("shouldImport")
        if(this.shouldImport){
          this.baseFS = this.file.externalRootDirectory;
          this.folder = "";
          this.folderStack.push("");
        }
        else{
          this.baseFS = this.file.externalRootDirectory;
          this.folder = "Books";
          this.folderStack.push("Books");
        }
        this.listDir();
   }

    listDir = () => {
    this.items = [];
    this.file.listDir(this.baseFS, this.folder).then(entries => {
      entries.forEach(r=>{
        this.items = [];
        entries.forEach(data=>{
          if(data.name[0] !== '.'){
            this.items.push(data);
          }
        })
      })
      this.items.sort((a,b)=> b.isDirectory - a.isDirectory)
    })
  }


  itemClicked(file: Entry,i) {

    if(file.isDirectory && !Object.keys(this.selectedFilesMap).length){
      let path = this.folder != '' ? this.folder + '/' + file.name : file.name;
      this.folder = path;
      this.folderStack.push(this.folder);

      this.listDir();
    }
    if(this.selectedFilesMap !== '{}'){
      this.itemPressed(file,i);
    }
    
  }

  finishCopyFile(){
    const path = this.baseFS + this.folder + '/';
    this.events.publish("filecopied");
    this.popovercontroller.dismiss(path);
  }

  itemPressed(file,i){
    this.items[i].selected = !this.items[i].selected;
    if(this.items[i].selected == true){
      this.selectedFilesMap[i] = file
    }
    else {
      this.selectedFilesMap[i]='';
    }
  }

  selectAll(){
    this.selectAllItems = !this.selectAllItems;
    if(this.selectAllItems){
      let i=0;
      this.selectedFilesMap = {};
      this.items.forEach(f=>{
        f.selected = true;
        this.selectedFilesMap[i]=f;
        i++;
      })
    }
    else{
      this.selectedFilesMap = {};
      let i=0;
      this.selectedFilesMap = {};
      this.items.forEach(f=>{
        f.selected = false;
        i++;
      })
    }

  }

  finishImport(){
    this.events.publish("itemSelected");
    this.popovercontroller.dismiss(this.selectedFilesMap);
    this.selectedFilesMap = {};
  }

  backButton(){
    this.folderStack.pop()
    this.folder = this.folderStack[this.folderStack.length-1]
    this.listDir();
  }
  close(){
    if(this.shouldImport){
      this.selectedFilesMap = {};
    }
    this.popovercontroller.dismiss();
  }
}
