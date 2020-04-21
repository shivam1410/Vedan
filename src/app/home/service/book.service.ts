import { Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Entry, File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { MusicService } from './music.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private socialSharing: SocialSharing,
    private fileOpener: FileOpener,
    private music: MusicService,
    private file:File,
  ) { }

  openWith(file:Entry){
    if(file.isFile){
      this.fileOpener.showOpenWithDialog(file.nativeURL, `application/pdf`)
    }
  }

  open(file: Entry) {
    this.fileOpener.open(file.nativeURL,'application/pdf')
  }

  share(file:Entry){
    this.socialSharing.share('','',file.nativeURL)
  }
}
