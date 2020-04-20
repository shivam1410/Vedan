import { Injectable } from '@angular/core';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Entry } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    private document: DocumentViewer,
    public navCtrl: NavController,
    private router: Router,
  ) { }

  openWith(file:Entry){
    if(file.isFile){
      this.fileOpener.showOpenWithDialog(file.nativeURL, 'application/pdf')
    }
  }

  open(file) {
    // const options: DocumentViewerOptions = {
      // title: file.name
    // }
    // this.document.viewDocument(file.nativeURL, 'application/pdf', options);
    // this.fileOpener.open(file.nativeURL,'application/pdf')
    // .then(d=>{
    //   console.log(d)
    // })
    // .catch(e=>{
    //   console.log(e)
    // })
    this.router.navigateByUrl(`/book/`,{state: file});

  }

  share(file:Entry){
    this.socialSharing.share('','',file.nativeURL)
  }

}
