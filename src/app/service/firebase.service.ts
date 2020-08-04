import { Injectable } from '@angular/core';

// import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';

import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class FirebaseSer {

  // store;
  storage = firebase.app().storage("gs://vedan-47f13.appspot.com");

  ref = this.storage.ref();

  bookref = this.ref.child('books/');
  constructor(
    // private storage: AngularFireStorage, 
    // private ref:AngularFireStorageReference,
    // private task:AngularFireUploadTask, 
  ) {
      // this.ref = this.storage.storage("gs://vedan-47f13.appspot.com");

    }

    
    fetch(){
      console.log("fetch")
      // const id = Math.random().toString(36).substring(2);
      // this.ref = this.storage.ref("gs://vedan-47f13.appspot.com");
      // console.log(this.ref)
      console.log(this.bookref.bucket)
      this.bookref.listAll().then((d)=>{
        console.log(d.items);
      })
    }


}
