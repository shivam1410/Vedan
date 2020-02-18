import { Component, OnInit } from '@angular/core';
import { File, Entry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, ToastController, Platform} from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router';
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
  ) {}

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
        this.items = entries;
      })
  }

  itemClicked(file: Entry) {
    if(file.isFile){
      console.log("application required")
      this.fileOpener.open(file.nativeURL, 'text/plain');
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
