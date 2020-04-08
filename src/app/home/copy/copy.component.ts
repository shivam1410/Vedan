import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { Events, NavParams, PopoverController} from '@ionic/angular'
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { CreateShelfComponent } from '../create-shelf/create-shelf.component';


@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
})
export class CopyComponent {

  folder = '';
  folderStack :string[] = [];

  directories = [];
  location = 'blbal';
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
    private diagnostic: Diagnostic,
    private events: Events,

  ) {
        this.shouldmove = this.navParams.get("shouldmove");
        this.shouldImport = this.navParams.get("shouldImport")

        if(this.shouldImport){
          this.folderStack.push("home");
          this.location = 'home';
          this.home();
        }
        else{
          this.setHomeForCopyyingDialog();
        }
   }

   setHomeForCopyyingDialog(){
    this.baseFS = this.file.externalRootDirectory;
    this.folder = "Books";
    this.folderStack = ["Books"];
    this.listDir();
   }
   //switch location internal or external
  switchLocation( loc){
    this.location = loc;
    console.log(this.location)
    this.folderStack.push(loc);

    switch (loc) {
      case 'home':
        this.home();
        break;
      case 'Internal':
        this.internal();
        break;
      case 'External':
        this.sdCard();
        break;
      default:
        break;
    }
  }
  home(){
    this.items = ['Internal','External'];
    this.folderStack = ['home'];
    this.location = 'home';
  }
  internal(){
    this.baseFS = this.file.externalRootDirectory;
    this.folder = ''
    this.listDir();
    
  }
  sdCard(){
    this.diagnostic.getExternalSdCardDetails()
    .then(data => {
      const path = data[0].filePath;
      this.baseFS = path;

      this.folder='.';
      this.listDir();
    })
    .catch(e=> console.error(e));
  }

  //main function to list all directories
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

//single click
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

  async createNewShelf(){
    const createShelfPopover = await this.popovercontroller.create({
      component: CreateShelfComponent,
      translucent: false,
    });
    
    this.events.subscribe('shelfAdded',()=>{
      createShelfPopover.onDidDismiss().then((data)=>{
        
        const shelfName = data.data;
        const path = this.baseFS + '/' + this.folder;
        this.file.createDir(path,shelfName,false)
        .then(data=>{
          this.folder += '/' + data.name;
          this.listDir();
        })
        .catch(e=>{
          console.error("Error in creating DIrectory");
        })
      })
    })
    createShelfPopover.onDidDismiss().then(()=>{
    })
    return await createShelfPopover.present();
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
    this.popovercontroller.dismiss({
      copyPath: this.baseFS + '/' + this.folder,
      fileArray: Object.values(this.selectedFilesMap)
    });
    this.selectedFilesMap = {};
  }

  backButton(){
    
    this.folderStack.pop();
    const top = this.folderStack[this.folderStack.length-1];
    console.log("top",top)
    switch (top) {
      case 'home':
      case 'Internal':
      case 'External':
        this.folderStack.pop();
        this.switchLocation(top);
        break;
      default:
        this.folder = top;
        this.listDir();
        break;
    }
  }
  close(){
    if(this.shouldImport){
      this.selectedFilesMap = {};
    }
    this.popovercontroller.dismiss();
  }
}
