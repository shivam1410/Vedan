import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, ToastController, Platform, Events} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import {  PopoverComponent } from '../home/popover/popover.component'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  copyFile = null;
  shouldMovie = false;
  folder = '';
  directories = [];
  items = [];
  nightmode:boolean = false;
  constructor(
    private file: File,
    private fileOpener:FileOpener,
    private alertCtrl:AlertController,
    private Toast:ToastController, 
    private platform:Platform,
    private router: Router,
    private route: ActivatedRoute,
    private document: DocumentViewer,
    private menu: MenuController,
    private statusBar: StatusBar,
    public popoverController: PopoverController,
    private events: Events,
  ) {
      // this.statusBar.overlaysWebView(true);
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#3700B3')
    }

  

  ngOnInit() {
    this.folder = "Books";
    this.folder = this.route.snapshot.paramMap.get('folder') || 'Books';

    this.platform.ready().then(() => {
        this.listDir(this.file.externalRootDirectory, this.folder);
      });

  }


  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  listDir = (path, dirName) => {
    this.file.listDir(path, dirName).then(entries => {
      entries.forEach(r=>{
        const ext = r.name.substring(r.name.length-4);
        this.items.push(r);
      })
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

      console.log("move to ", folder)
      this.router.navigateByUrl(`/home/${folder}`)
    }
  }

  startCopy(){
    
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: false,
      componentProps: {nightmode:this.nightmode}
    });
    
    this.events.subscribe('nightmodechanged',()=>{
      popover.onDidDismiss().then((data)=>{
        console.log('event data', data)
        this.nightmode = data.data;
      })
    })

    return await popover.present();
  }

}
