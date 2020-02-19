import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, ToastController, Platform} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

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
  ) {  }

  ngOnInit() {
    this.folder = '';
    this.folder = this.route.snapshot.paramMap.get('folder') || '';
    console.log("passed folder", this.folder);

    this.platform.ready().then(() => {
        this.listDir(this.file.externalRootDirectory, this.folder);
      });
  }

  listDir = (path, dirName) => {
    this.file.listDir(path, dirName).then(entries => {
      entries.forEach(r=>{
        const ext = r.name.substring(r.name.length-4);
        if(r.isFile && (ext == ".pdf" || ext == ".PDF")){
          console.log(r.name)
          this.items.push(r);
        }
        if(r.isDirectory){
          
          this.items.push(r);
          console.log(r);
        }
      })
        // this.items = entries;
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
