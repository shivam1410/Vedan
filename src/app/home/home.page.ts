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
  location: string = '';
  constructor(
    private file: File,
    private Toast:ToastController,
    private alertctrl:AlertController,
    private platform:Platform,
    private router: Router,
    private route: ActivatedRoute,
    private document: DocumentViewer,
    private menu: MenuController,
    public popoverController: PopoverController,
    private events: Events,
    private diagnostic: Diagnostic,
  ) {
     
    }

  ngOnInit() {
    this.baseFS = this.route.snapshot.paramMap.get('baseFS') || this.file.externalRootDirectory;
    this.folder = this.route.snapshot.paramMap.get('folder') || 'Books';
    this.location = this.route.snapshot.paramMap.get('location') || 'home';
    this.platform.ready().then(() => {
        this.listDir();
      })
      .catch(e=>{
        console.log("Platform Not Ready");
      })   
  }
  sdCard(){
    this.diagnostic.getExternalSdCardDetails()
    .then(data => {
      const path = data[0].filePath;
      this.baseFS = path;
      // this.file.listDir("file:///storage/881C-0913","./").then(entries => {
      //   console.log(entries)
      // })
      this.folder='.';
      this.listDir();
      this.location = "sdCard";
      this.menu.close();
    })
    .catch(e=> console.error(e))
  }
  setDirectory(root){
    this.baseFS = this.file.externalRootDirectory;
    this.folder = root;
    this.listDir();
    this.menu.close();
    if(root){
      this.location = 'home';
    } else {
      this.location = 'internal'
    }
  }
  network(){
    this.location = 'network'
    this.menu.close();
  }
  openFirst() {
    console.log("menu called")
    console.log(this.folder)
    this.menu.enable(true);
    this.menu.open();
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
        this.toggleDarkMode(data.data)
      })
    })
    this.events.subscribe('createNewShelf',()=>{
      popover.onDidDismiss().then(()=>{
        this.createNewShelf();
      })
    })
    return await popover.present();
      }

  listDir() {
    console.log(this.baseFS)
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
      let baseFS = this.baseFS;
      
      this.router.navigate(['.',{
        folder:path,
        baseFS:baseFS,
        location: this.location
      }])
    }
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
    popover.onDidDismiss().then(()=>{
      console.log("createshelf dismissed")
    })
    return await popover.present();
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

  toggleDarkMode(nightmode){

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

    if(nightmode){
      
    }
  }

}
