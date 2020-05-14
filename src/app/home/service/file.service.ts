import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Events, PopoverController } from '@ionic/angular';
import { CopyComponent } from '../copy/copy.component';
import { ToastrService } from 'src/app/service/toastr.service';
import { AlertService } from 'src/app/service/alert.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private file: File,
    private events: Events,
    private popoverController: PopoverController,
    private toastr: ToastrService,
    private alert: AlertService,
  ) { }

  public _showSpinner:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  listDirectories(baseFS,folder,shouldHide){
    return this.file.listDir(baseFS,folder).then((entries:  Array<any>) => {
      let items = [];
      if(shouldHide) {
        entries.forEach(data=>{
          if(data.name[0] !== '.'){
            items.push(data);
          }
        })
      }
      else {
        entries.forEach(data=>{
          items.push(data);
        })
      }
      items.sort((a,b)=> b.isDirectory - a.isDirectory)
      items.sort((a,b) => this.alphaSort(a,b))
      this._showSpinner.next(false);
      return items;
    })
  }

  // data.getMetadata(m=>{
  //   console.log('modification', + new Date())
  //   var d = new Date(m.modificationTime);
  //   var date = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
  //   var time = d.getHours()>12 ?
  //     (d.getHours()-12) + ':' + d.getMinutes() + ' ' + 'pm' :
  //     (d.getHours()) + ':' + d.getMinutes() + ' ' + 'am';
  //     data = {
  //       ...data,
  //       modificationTime : date + ' ' + time,
  //       size : m.size
  //     }
  // })
  alphaSort(a,b){
    const bandA = a.name.toUpperCase();
    const bandB = b.name.toUpperCase();

    let comp = 0;
    if(bandA > bandB){
      comp = 1;
    }
    if(bandB > bandA){
      comp = -1;
    }
    return comp;
  }
  CopyFile(){

  }

  moveFile(){

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
            this.debugCopying(copyPath,file,data.data,moveFile)
            .then(()=>{
              // this.listDir();
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
          this._showSpinner.next(true);
          file.forEach(f=>{
            this.debugCopying(copyPath,f,data.data,moveFile)
            .then(()=>{ 
              i++;
              if(i+j === file.length){
                // this.listDir();
                if(moveFile){
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                } else {
                  if(i)this.toastr.show(`${i} items Copied`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                }
                this._showSpinner.next(false);
              }
            })
            .catch(e=>{
              j++;
              if(i+j === file.length){
                // this.listDir();
                if(moveFile){
                  if(i)this.toastr.show(`${i} items Moved`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                } else {
                  if(i)this.toastr.show(`${i} items Copied`)
                  if(j)this.toastr.show(`${j} Items Failed`);
                }
                this._showSpinner.next(false);
              }
            })
          })
        }
      })
    })
    return await popover.present();
  } 

  debugCopying(path,copyFile,newpath,shouldMove) {
    if(shouldMove) {
      if(copyFile.isDirectory){
        return this.file.moveDir(path,copyFile.name,newpath,'')
      } 
      else {
        return this.file.moveFile(path,copyFile.name,newpath,'')
      }
    } 
    else {
      if(copyFile.isDirectory){
        return this.file.copyDir(path,copyFile.name,newpath,'')
      } 
      else {
        return this.file.copyFile(path,copyFile.name,newpath,'')
      }
    }
  }  

  deleteFile(){

  }
}
