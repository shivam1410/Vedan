import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { Platform, Events} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';

import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import {  PopoverComponent } from '../home/popover/popover.component'
import { CopyComponent } from './copy/copy.component';
import { CreateShelfComponent } from './create-shelf/create-shelf.component';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileService } from './service/file.service';
import { ToastrService } from '../service/toastr.service';
import { AlertService } from '../service/alert.service';
import { BookService } from './service/book.service';
import { NightmodeService } from '../service/nightmode.service';

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
    private platform:Platform,
    private router: Router,
    private route: ActivatedRoute,
    private menu: MenuController,
    public popoverController: PopoverController,
    private events: Events,
    private diagnostic: Diagnostic,
    private fileService: FileService,
    private toastr: ToastrService,
    private alert: AlertService,
    private bookService: BookService,
    private nightMd: NightmodeService,
  ) {
    this.spinner = true;
   }

  ngOnInit() {
    this.spinner = true;
    this.platform.ready().then(() => {
      this.nightMd.toggleDarkMode(true);
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
              this.toastr.show("Press 1 more time to exit");
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
    this.toastr.show("Network not Created now");
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
        this.nightMd.toggleDarkMode(data.data)
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
    this.fileService.listDirectories(this.baseFS,this.folder,shouldHide).then(data=>{
      this.items = data;
      this.spinner = false;
    })
  }

  //click actions on list items=>single click,Long press 
  //on single click, to enter or open
  itemClicked(file: Entry,i) {
    if(!Object.keys(this.selectedFilesMap).length){
      if(file.isFile){
        this.bookService.open(file);
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
        this.copyItem(ev,file,true,false,this.baseFS,this.folder)
      }
    })
  
    return await popover.present();
  }

  async renameFile(f){
    const popover = await this.popoverController.create({
      component: CreateShelfComponent,
      translucent: false,
      cssClass : 'create-shelf-popover',
      componentProps:{
        rename: true,
        filename: f.name
      }
    });
    const path = this.baseFS + '/' + this.folder + '/';
      popover.onDidDismiss().then((data)=>{
        if(data.data && data.data != f.name){      
          this.spinner = true;
          if(f.isDirectory){
            this.file.moveDir(path,f.name,path,data.data)
            .then(d=>{
              this.listDir();
            })
            .catch(e=>{
              console.error("file not rename")
              this.spinner = false;
            }) 
          }
          if(f.isFile){
            this.file.moveFile(path,f.name,path,data.data)
            .then(d=>{
              this.listDir();
            })
            .catch(e=>{
              console.error("file not rename")
              this.spinner = false;
            }) 
          }
        }
      })
    return await popover.present();
  }

  async createNewShelf(){
    const popover = await this.popoverController.create({
      component: CreateShelfComponent,
      cssClass : 'create-shelf-popover',
      translucent: false,
    });
    
    this.events.subscribe('shelfAdded',()=>{
      popover.onDidDismiss().then((data)=>{
        
        const shelfName = data.data;
        const path = this.baseFS + '/' + this.folder;
        this.file.createDir(path,shelfName,false)
        .then(()=>{
          this.listDir();
          this.toastr.show("Shelf Created")
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
    this.bookService.openWith(file);
  }

  shareFile(file){
    this.bookService.share(file);
  }
  //copy,move Multiple files
  copyMultiple(ev,moveFile = false){
    const copyfiles: Entry[] = Object.values(this.selectedFilesMap);
    this.copyItem(ev,copyfiles,moveFile,true,this.baseFS,this.folder)
    .finally(()=>{
      console.log('data')
      this.discardLongPressOptions();
      this.listDir();
    })
  }

//import items from other loacation(internal,sdCard)
  async importItems(ev){
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
          this.fileService.debugCopying(copyPath,f,newPath,false)
          .then(()=>{ 
            i++;
            if(i+j === copyFileArray.length){
              this.listDir();
              if(i)this.toastr.show(`${i} Items imported`);
              if(j)this.toastr.show(`${j} Items Failed`);
              this.spinner = false;
            }
          })
          .catch(e=>{
            j++;
            if(i+j === copyFileArray.length){
              this.listDir();
              if(i)this.toastr.show(`${i} Items imported`);
              if(j)this.toastr.show(`${j} Items Failed`);
              this.spinner = false;
            }
          })
        })
      })
    })

    return await popover.present();
  }
  
  async copyItem(ev,file, moveFile = false,multipleCopy = false,baseFS,folder){
    const copyPath = baseFS + '/' + folder + '/';
  
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
            this.fileService.debugCopying(copyPath,file,data.data,moveFile)
            .then(()=>{
              this.listDir()
              if(moveFile){
                this.toastr.show("Moved")
              } else {
                this.toastr.show("Copied")
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
            this.fileService.debugCopying(copyPath,f,data.data,moveFile)
            .then(()=>{ 
              i++;
              if(i+j === file.length){
                this.listDir();
                if(moveFile){
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                } else {
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                }
                this.spinner = false;
              }
            })
            .catch(e=>{
              j++;
              if(i+j === file.length){
                this.listDir();
                if(moveFile){
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                } else {
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
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
    this.alert.show(header,message,buttons);
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
    this.alert.show(header,message,buttons)
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
        this.toastr.show("Shelf Removed")
      })
      .catch(e =>{
        console.error(e.message);
      });
    } 
    else {
      this.file.moveFile(path,removeFile.name,newpath,'')
      .then(()=>{
        this.listDir()
        this.toastr.show("book Removed")
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
      this.toastr.show("Trash Cleared")
      this.spinner = false;
      this.listDir();
    })
    .catch(e=>{
      console.error(e)
    })
   }

}
