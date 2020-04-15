import { Injectable } from '@angular/core';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Entry } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    private document: DocumentViewer,

  ) { }

  openWith(file:Entry){
    if(file.isFile){
      this.fileOpener.showOpenWithDialog(file.nativeURL, 'application/pdf')
    }
  }

  open(file: Entry) {
    const options: DocumentViewerOptions = {
      title: file.name
    }
    this.document.viewDocument(file.nativeURL, 'application/pdf', options);

  }

  share(file:Entry){
    this.socialSharing.share('','',file.nativeURL)
  }
}
