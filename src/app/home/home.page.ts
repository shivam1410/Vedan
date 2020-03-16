import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { AlertController, ToastController, Platform, Events} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import {  PopoverComponent } from '../home/popover/popover.component'
import { CopyComponent } from './copy/copy.component';
import { CreateShelfComponent } from './create-shelf/create-shelf.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  copyFile = null;
  shouldMove = false;
  folder = '';
  directories = [];
  items = [];
  nightmode:boolean = false;
  baseFS : string= '';
  currentFolder: string = '';
  constructor(
    private file: File,
    private Toast:ToastController,
    private alertctrl:AlertController,
    private platform:Platform,
    private router: Router,
    private route: ActivatedRoute,
    private document: DocumentViewer,
    private menu: MenuController,
    private statusBar: StatusBar,
    public popoverController: PopoverController,
    private events: Events,
  ) {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#3700B3')
    }

  ngOnInit() {
    this.baseFS = this.file.externalRootDirectory;

    this.folder = "Books";
    this.folder = this.route.snapshot.paramMap.get('folder') || 'Books';
    this.platform.ready().then(() => {
        this.listDir();
      })
      .catch(e=>{
        console.log("Platform Not Ready");
      })
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  async optionsPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: false,
      componentProps: {nightmode:this.nightmode},
      cssClass: 'option-popover'
    });
    
    this.events.subscribe('nightmodechanged',()=>{
      popover.onDidDismiss().then((data)=>{
        this.nightmode = data.data;
      })
    })
    this.events.subscribe('createNewShelf',()=>{
      this.createNewShelf();
    })
    return await popover.present();
      }

  listDir() {
    this.file.listDir(this.baseFS, this.folder).then(entries => {
      this.items = entries;
      this.items.sort((a,b)=> b.isDirectory - a.isDirectory)
    })
  }

  itemClicked(file: Entry) {
    if(file.isFile){  
      const options: DocumentViewerOptions = {
        title: file.name
      }
      this.document.viewDocument(file.nativeURL, 'application/pdf', options);
    }
    else {
      let path = this.folder != '' ? this.folder + '/' + file.name : file.name;
      let folder =  encodeURIComponent(path);

      this.router.navigateByUrl(`/home/${folder}`)
    }
  }

  async copyItem(ev,file, moveFile = false){
    this.copyFile = file;
    
    const popover = await this.popoverController.create({
      component: CopyComponent,
      event: ev,
      translucent: false,
      cssClass: 'custom-popover',
      componentProps: {
        baseFS:this.baseFS
      }
    });
    
    this.events.subscribe('filecopied',()=>{
      popover.onDidDismiss().then(data=>{
        console.log(data)
        this.debugCopying(file,data.data,moveFile);
      })
    })
    return await popover.present();
  }


  deleteItem(){

  }

  async createNewShelf(){
    const popover = await this.popoverController.create({
      component: CreateShelfComponent,
      translucent: false,
    });
    
    this.events.subscribe('shelfAdded',()=>{
      popover.onDidDismiss().then((data)=>{
        
        const shelfName = data.data;
        const path = this.baseFS + this.folder;
        this.file.createDir(path,shelfName,false)
        .then(()=>{
          this.listDir();
        })
        .catch(e=>{
          console.log("Error in creating DIrectory");
        })
      })
    })
    return await popover.present();
  }

  debugCopying(copyFile,newpath,shouldMove) {

    const path = this.baseFS + this.folder + '/';
    
      if(shouldMove) {
        if(copyFile.isDirectory){
          this.file.moveDir(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
          })
          .catch(e =>{
            console.log(e.message);
          });
        } else {
          this.file.moveFile(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
          })
          .catch(e =>{
            console.log(e.message);
          });
        }
      } else {
        if(copyFile.isDirectory){
          this.file.copyDir(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
          })
          .catch(e =>{
            console.log(e.message);
          });
        } else {
          this.file.copyFile(path,copyFile.name,newpath,'')
          .then(()=>{
            this.listDir()
          })
          .catch(e =>{
            console.log(e.message);
          });
        }
      }

  }

}
