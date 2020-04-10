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
  spinner: boolean = false;
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
  ) {
    this.spinner = true;
   }

  ngOnInit() {
    this.spinner = true;
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
            this.file.createDir(this.baseFS, this.folder,false)
            this.spinner = false;
          })
        }
        else{
          this.listDir();
        }
        //quitting app on back button
        let counter =0;
        this.platform.backButton.subscribe(() => {
          this.discardLongPressOptions();
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
        this.spinner = false;
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
    this.baseFS = this.file.externalRootDirectory;
    this.folder = root;
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
    .catch(e=> console.error(e))
  }
  network(){
    this.createToast("Network not Created now");
  }
  openTrash(){
    
    const path = this.baseFS + '/Books'
    const trashFolder = '.bin';
    this.file.createDir(path,trashFolder,false)
    .then(()=>{
      this.folder = 'Books/.bin';
      this.baseFS = this.file.externalRootDirectory;
      this.listDir(false);
    })
    .catch(e=>{
      console.error(e)
      this.folder = 'Books/.bin';
      this.baseFS = this.file.externalRootDirectory;
      this.listDir(false);
    })
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
      this.spinner = false;
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

  itemPressed(file,i,ev=null){
    if(file.isFile){
      this.items[i].selected = !this.items[i].selected;
      if(this.items[i].selected == true){
        this.selectedFilesMap[i] = file
      }
      else {
        this.selectedFilesMap[i]='';
      }
    } else {
      this.directoryOptionPopOver(ev,file,i);
    }
  }

  selectAll(){
    this.selectAllItems = !this.selectAllItems;
    if(this.selectAllItems){
      let i=0;
      this.selectedFilesMap = {};
      this.items.forEach(f=>{
        if(!f.isDirectory){
          f.selected = true;
          this.selectedFilesMap[i]=f;
          i++;
        }
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


  async directoryOptionPopOver(ev,file,index){
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: false,
      componentProps: {
        type:'directoryOptions',
      },
      cssClass: 'option-popover'
    });

    popover.onDidDismiss().then(data=>{
      if(data.data === "delete"){
        this.moveSingleToBin(file);
      }
      if(data.data === "rename"){
        this.renameFile(file);
      }
      if(data.data === "move"){
        this.copyItem(ev,file,true,false)
      }
    })
  
    return await popover.present();
  }

  async renameFile(f){
    const popover = await this.popoverController.create({
      component: CreateShelfComponent,
      translucent: false,
      componentProps:{
        rename: true,
        filename: f.name
      }
    });
    const path = this.baseFS + '/' + this.folder + '/';
      popover.onDidDismiss().then((data)=>{
        this.spinner = true;
        if(data.data){       
          if(f.isDirectory){
            this.file.moveDir(path,f.name,path,data.data)
            .then(d=>{
              this.listDir();
              this.spinner = false;
            })
            .catch(e=>{
              console.error("file not rename")
            }) 
          }
          if(f.isFile){
            this.file.moveFile(path,f.name,path,data.data)
            .then(d=>{
              this.listDir();
              this.spinner = false;
            })
            .catch(e=>{
              console.error("file not rename")
            }) 
          }
        }
      })
    return await popover.present();
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
    return await popover.present();
  }
  

  //modification options => copy,move,paste,openwith delete
  //openWith another application other then cleverdox viewer
  openWith(file:Entry){
    if(file.isFile){
      this.fileOpener.showOpenWithDialog(file.nativeURL, 'application/pdf')
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
        const copyPath = data.data.copyPath;
        const newPath = this.baseFS + '/' + this.folder;
        const copyFileArray: [] = data.data.fileArray;
        let i=0;
        let j=0;
        this.spinner = true;
        copyFileArray.forEach(f=>{
          this.debugCopying(copyPath,f,newPath,false)
          .then(()=>{ 
            i++;
            if(i+j === copyFileArray.length){
              this.listDir();
              if(i)this.createToast(`${i} Items imported`);
              if(j)this.createToast(`${j} Items Failed`);
              this.spinner = false;
            }
          })
          .catch(e=>{
            j++;
            if(i+j === copyFileArray.length){
              this.listDir();
              if(i)this.createToast(`${i} Items imported`);
              if(j)this.createToast(`${j} Items Failed`);
              this.spinner = false;
            }
          })
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
            this.debugCopying(copyPath,file,data.data,moveFile)
            .then(()=>{
              this.listDir()
              if(moveFile){
                this.createToast("Moved")
              } else {
                this.createToast("Copied")
              }
            })
            .catch(e =>{
              console.error(e.message);
            });
          }
        else{
          let i = 0;
          let j = 0;
          this.spinner = true;
          file.forEach(f=>{
            this.debugCopying(copyPath,f,data.data,moveFile)
            .then(()=>{ 
              i++;
              if(i+j === file.length){
                this.listDir();
                if(moveFile){
                  if(i)this.createToast(`${i} items Moved`)
                  if(j)this.createToast(`${j} Items Failed`);
                } else {
                  if(i)this.createToast(`${i} items Moved`)
                  if(j)this.createToast(`${j} Items Failed`);
                }
                this.spinner = false;
              }
            })
            .catch(e=>{
              j++;
              if(i+j === file.length){
                this.listDir();
                if(moveFile){
                  if(i)this.createToast(`${i} items Moved`)
                  if(j)this.createToast(`${j} Items Failed`);
                } else {
                  if(i)this.createToast(`${i} items Moved`)
                  if(j)this.createToast(`${j} Items Failed`);
                }
                this.spinner = false;
              }
            })
          })
          this.discardLongPressOptions();
        }
      })
    })
    return await popover.present();
  }

  //main function to copy,move single file
  debugCopying(path,copyFile,newpath,shouldMove) {
    if(shouldMove) {
      if(copyFile.isDirectory){
        return this.file.moveDir(path,copyFile.name,newpath,'')
      } 
      else {
        return this.file.moveFile(path,copyFile.name,newpath,'')
      }
    } 
    else {
      if(copyFile.isDirectory){
        return this.file.copyDir(path,copyFile.name,newpath,'')
      } 
      else {
        return this.file.copyFile(path,copyFile.name,newpath,'')
      }
    }
  }  
  
  //deleting functions
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
        handler: () => {
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
          this.spinner = true;
          const deletefiles = Object.values(this.selectedFilesMap);
          deletefiles.forEach((f:Entry)=>{
            this.moveToBin(f);
          })
          this.spinner = false;
          this.discardLongPressOptions();
        }
      }
    ]
    this.createAlert(header,message,buttons)
  }

  //ain function to move files to bin
  moveToBin(removeFile: Entry){
    this.file.createDir(this.baseFS + "/Books/",".bin",false);
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
     this.spinner = true;
    const path = this.baseFS + '/' + 'Books/';
    this.file.removeRecursively(path,'.bin')
    .then(()=>{
      this.folder = 'Books';
      this.location = 'home'
      this.createToast("Trash Cleared")
      this.spinner = false;
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