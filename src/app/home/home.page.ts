import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { AlertController, ToastController, Platform, Events} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import {  PopoverComponent } from '../home/popover/popover.component'
import { CopyComponent } from './copy/copy.component';
import { CreateShelfComponent } from './create-shelf/create-shelf.component';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  folder = '';
  items = [];
  nightmode:boolean = false;
  baseFS : string= '';
  location: string = '';
  hideDirectoryBool: boolean = true;
  selectedFilesMap = {};
  selectAllItems = false;
  constructor(
    private file: File,
    private toast:ToastController,
    private alertctrl:AlertController,
    private platform:Platform,
    private router: Router,
    private route: ActivatedRoute,
    private document: DocumentViewer,
    private menu: MenuController,
    public popoverController: PopoverController,
    private events: Events,
    private diagnostic: Diagnostic,
    private fileOpener: FileOpener,
    private socialSharing: SocialSharing,
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
        this.baseFS = this.route.snapshot.paramMap.get('baseFS') || this.file.externalRootDirectory;
        this.folder = this.route.snapshot.paramMap.get('folder') || 'Books';
        this.location = this.route.snapshot.paramMap.get('location') || 'home';
        
        if(this.folder == 'Books')
        {
          this.file.checkDir(this.baseFS,this.folder)
          .then(()=>{
            this.listDir();
          })
          .catch(e=>{
            console.error("creating Books Shelf")
            this.file.createDir(this.baseFS, this.folder,false)
          })
        }
        else{
          this.listDir();
        }
        //quitting app on back button
        let counter =0;
        this.platform.backButton.subscribe(() => {
          if(counter<2){
            counter++;
            if(counter==2){
              this.createToast("Press 1 more time to exit");
            }
            setTimeout(() => { 
              counter = 0 }, 2000);
          }else {
            navigator['app'].exitApp()
          }
        })
              
      })
      .catch(e=>{
        console.error("Platform Not Ready");
      })
  }

  //menu functions switch
  openFirst() {
    this.menu.enable(true);
    this.menu.open();
  }
  setLocation(root){
    this.selectedFilesMap = {}
    switch (root) {
      case '':
        this.location = 'internal';
        this.setDirectory(root);
        break;
      case 'Books':
        this.location = 'home'
        this.setDirectory(root);
        break;
      case 'sdCard':
        this.location = 'sdCard'
        this.sdCard()
         break;
      case 'network':
        this.location = 'network'
        this.network()
        break; 
      case 'trash':
        this.location = 'trash'
        this.openTrash();
        break;
      default:
        break;
    }
    this.menu.close();
  }

  setDirectory(root){
    console.log(root)

    this.baseFS = this.file.externalRootDirectory;
    this.folder = root;
    this.listDir();
    console.log(this.folder)
  }
  sdCard(){
    this.diagnostic.getExternalSdCardDetails()
    .then(data => {
      const path = data[0].filePath;
      this.baseFS = path;

      this.folder='.';
      this.listDir();
    })
    .catch(e=> console.error(e))
  }
  network(){
    this.createToast("Network not Created now");
  }
  openTrash(){
    this.folder = 'Books/.bin';
    this.baseFS = this.file.externalRootDirectory;
    this.file.createDir(this.baseFS + '/Books', '.bin', false);
    this.listDir(false);
  }

  //3-dot options popover
  async optionsPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: false,
      componentProps: {
        nightmode:this.nightmode,
        hideDirectoryBool: this.hideDirectoryBool
      },
      cssClass: 'option-popover'
    });
    
    this.events.subscribe('nightmodechanged',()=>{
      popover.onDidDismiss().then((data)=>{
        this.nightmode = data.data;
        // this.toggleDarkMode(data.data)
      })
    })
    this.events.subscribe('createNewShelf',()=>{
      popover.onDidDismiss().then(()=>{
        this.createNewShelf();
      })
    })
    this.events.subscribe('hiddenStateChanged',()=>{
      popover.onDidDismiss().then(data=>{
        this.hideDirectoryBool = data.data;
        this.listDir(data.data);
      })
    })
    return await popover.present();
  }

  //main function to list all directries and files
  listDir(shouldHide = true) {
    this.file.listDir(this.baseFS, this.folder).then(entries => {
      if(shouldHide) {
        this.items = [];
        entries.forEach(data=>{
          if(data.name[0] !== '.'){
            this.items.push(data);
          }
        })
      }
      else {
        this.items = entries;
      }
      this.items.sort((a,b)=> b.isDirectory - a.isDirectory)
    })
  }

  //click actions on list items=>single click,Long press 
  //on single click, to enter or open
  itemClicked(file: Entry,i) {
    if(!Object.keys(this.selectedFilesMap).length){
      if(file.isFile){  
        const options: DocumentViewerOptions = {
          title: file.name
        }
        this.document.viewDocument(file.nativeURL, 'application/pdf', options);
      }
      else {
        const path = this.folder != '' ? this.folder + '/' + file.name : file.name;
        const baseFS = this.baseFS;
        this.router.navigate(['.',{
          folder:path,
          baseFS:baseFS,
          location: this.location
        }])
      }
    }
    else {
      this.itemPressed(file,i);
    }
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
      let i=0;
      this.selectedFilesMap = {};
      this.items.forEach(f=>{
        f.selected = false;
        this.selectedFilesMap[i]="";
        i++;
      })
    }

  }
  discardLongPressOptions(){
    this.selectedFilesMap = {};
    this.listDir();
  }

  async createNewShelf(){
    const popover = await this.popoverController.create({
      component: CreateShelfComponent,
      translucent: false,
    });
    
    this.events.subscribe('shelfAdded',()=>{
      popover.onDidDismiss().then((data)=>{
        
        const shelfName = data.data;
        const path = this.baseFS + '/' + this.folder;
        this.file.createDir(path,shelfName,false)
        .then(()=>{
          this.listDir();
          this.createToast("Shelf Created")
        })
        .catch(e=>{
          console.error("Error in creating DIrectory");
        })
      })
    })
    popover.onDidDismiss().then(()=>{
    })
    return await popover.present();
  }
  

  //modification options => copy,move,paste,openwith delete
  //openWith another application other then cleverdox viewer
  openWith(file:Entry){
    if(file.isFile){
      this.fileOpener.open(file.nativeURL, 'application/pdf')
    }
  }

  //copy,move Multiple files
  copyMultiple(ev,moveFile = false){
    const copyfiles: Entry[] = Object.values(this.selectedFilesMap);
    this.copyItem(ev,copyfiles,moveFile,true);

  }

//import items from other loacation(internal,sdCard)
  async importItems(ev){
    // const newpath;
    // const oldpa
    const popover = await this.popoverController.create({
      component: CopyComponent,
      event: ev,
      translucent: false,
      cssClass: 'custom-popover',
      componentProps: {
        shouldImport: true
      }
    });

    this.events.subscribe('itemSelected',()=>{
      popover.onDidDismiss().then(data=>{
        console.log(data.data,data.data.copyPath)
        const copyPath = data.data.copyPath;
        const newPath = this.baseFS + '/' + this.folder;
        const copyFileArray = data.data.fileArray;
        copyFileArray.forEach(f=>{
          this.debugCopying(copyPath,f,newPath,false);
        })
      })
    })

    return await popover.present();
  }

  //create popover for copy/move files
  async copyItem(ev,file, moveFile = false,multipleCopy = false){
    const copyPath = this.baseFS + '/' + this.folder + '/';
  
    const popover = await this.popoverController.create({
      component: CopyComponent,
      event: ev,
      translucent: false,
      cssClass: 'custom-popover',
      componentProps: {
        shouldmove: moveFile
      }
    });
    
    this.events.subscribe('filecopied',()=>{
      popover.onDidDismiss().then(data=>{
        if(!multipleCopy){
            this.debugCopying(copyPath,file,data.data,moveFile);
        }
        else{
          file.forEach(f=>{
            this.debugCopying(copyPath,f,data.data,moveFile);
          })
          this.discardLongPressOptions();
        }
      })
    })
    return await popover.present();
  }

  //main function to copy,move single file
  debugCopying(path,copyFile,newpath,shouldMove) {
    console.log(copyFile,path)
    if(path === newpath){
      if(!shouldMove){
        this.createToast("Cant Copy to Same Directory");
      } 
      else {
        this.createToast("Cant Move to Same Directory");
      }
    } 
    else {
      if(shouldMove) {
        if(copyFile.isDirectory){
          this.file.moveDir(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
            this.createToast("Moved")
          })
          .catch(e =>{
            console.error(e.message);
          });
        } 
        else {
          this.file.moveFile(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
            this.createToast("Moved")
          })
          .catch(e =>{
            console.error(e.message);
          });
        }
      } 
      else {
        if(copyFile.isDirectory){
          this.file.copyDir(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
            this.createToast("Copied")
          })
          .catch(e =>{
            console.error(e.message);
          });
        } 
        else {
          this.file.copyFile(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
            this.createToast("Copied")
          })
          .catch(e =>{
            console.error(e.message);
          });
        }
      }
    }
  }  
  
  //alert for deleting single file to bin
  moveSingleToBin(removeFile:Entry){
    let header;
    let message;
    if(removeFile.isDirectory){
      header = 'Remove Shelf';
      message = 'Do you want to remove this shelf?';
    }else{
      header = 'Remove Book';
      message = 'Do you want to remove this Books?';
    }
    const buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: (blah) => {
          this.discardLongPressOptions();
        }
      }, {
        text: 'Sure',
        handler: () => {
          this.moveToBin(removeFile);
          this.discardLongPressOptions();
        }
      }
    ]
    this.createAlert(header,message,buttons);
  }

   //alert for deleting multiple files to bin
  moveMultipleToBin(){
    const header = 'Delete items';
    const message = 'Do you want to delete all these Books and shelves?';
    const buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: (blah) => {
          this.discardLongPressOptions();
        }
      }, {
        text: 'Sure',
        handler: () => {
          const deletefiles = Object.values(this.selectedFilesMap);
          deletefiles.forEach((f:Entry)=>{
            this.moveToBin(f);
          })
          this.discardLongPressOptions();
        }
      }
    ]
    this.createAlert(header,message,buttons)
  }

  //ain function to move files to bin
  moveToBin(removeFile: Entry){
    this.file.createDir(this.baseFS,"Books/.bin",false);
    const path = this.baseFS + this.folder;
    const newpath = this.baseFS + '/' + 'Books/.bin';
    if(removeFile.isDirectory){
      this.file.moveDir(path,removeFile.name,newpath,'')
      .then(()=>{
        this.listDir()
        this.createToast("Shelf Removed")
      })
      .catch(e =>{
        console.error(e.message);
      });
    } 
    else {
      this.file.moveFile(path,removeFile.name,newpath,'')
      .then(()=>{
        this.listDir()
        this.createToast("book Removed")
      })
      .catch(e =>{
        console.error(e.message);
      });
    }
  }

  //deleting files from bin
  deleteFromBin( deleteFile: Entry){
    const path = this.baseFS + '/' + this.folder;
    if(deleteFile.isDirectory){
      this.file.removeRecursively(path,deleteFile.name)
      .then(()=>{
        this.listDir();
      })
      .catch(e=>{
        console.error(e)
      })
    }
    else {
      this.file.removeFile(path,deleteFile.name)
      .then(()=>{
        this.listDir();
      })
      .catch(e=>{
        console.error(e)
      })
    }
   }

   //deleting all files simultaneously from bin
   emptyBin(){
    const path = this.baseFS + '/' + 'Books/';
    this.file.removeRecursively(path,'.bin')
    .then(()=>{
      this.folder = 'Books';
      this.location = 'home'
      this.createToast("Trash Cleared")
      this.listDir();
    })
    .catch(e=>{
      console.error(e)
    })
   }

   async createToast(str){
    const toast = await this.toast.create({
      message: str,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }

   async createAlert(header,message,buttons){
    const alert = await this.alertctrl.create({
     header: header,
     message: message,
     buttons: buttons
   });

   await alert.present();
  }
  
  shareFile(file:Entry){

    this.socialSharing.share('','',file.nativeURL)
    .catch(e=>{
      console.error("failure");
    })
  }

}


// toggleDarkMode(nightmode){

  // // Query for the toggle that is used to change between themes
  // const toggle = nightmode

  // // Listen for the toggle check/uncheck to toggle the dark class on the <body>
  // toggle.addEventListener('ionChange', (ev) => {
  //   document.body.classList.toggle('dark', ev.detail.checked);
  // });

  // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // // Listen for changes to the prefers-color-scheme media query
  // prefersDark.addListener((e) => checkToggle(e.matches));

  // // Called when the app loads
  // function loadApp() {
  //   checkToggle(prefersDark.matches);
  // }

  // // Called by the media query to check/uncheck the toggle
  // function checkToggle(shouldCheck) {
  //   toggle.checked = shouldCheck;
  // }

  // if(nightmode){
    
  // }
// }