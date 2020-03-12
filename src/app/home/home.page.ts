import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, ToastController, Platform} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

import { MenuController } from '@ionic/angular';


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
  ) {  }

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
        // if(r.isFile && (ext == ".pdf" || ext == ".PDF")){
        //   this.items.push(r);
        // }
        // if(r.isDirectory){
          
        //   this.items.push(r);
        // }
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
      // this.fileOpener.open(file.nativeURL, 'text/plain');
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

}
