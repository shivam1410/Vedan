import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { NavController, NavParams } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { PDFPageProxy, PDFPageViewport, PDFRenderTask } from 'pdfjs-dist/webpack';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
})
export class BookComponent implements OnInit {

  book;
  webViewPath: string= ''
  totalPageArray = [];
  tempFile = {
    "isFile": true,
    "isDirectory": false,
    "name": "rumi-the-book-of-love.pdf",
    "fullPath": "/Books/rumi-the-book-of-love.pdf",
    "filesystem": "<FileSystem: sdcard>",
    "nativeURL": "file:///storage/emulated/0/Books/rumi-the-book-of-love.pdf"
  }

  pdfDocument: pdfjsLib.PDFDocumentProxy;
    PDFJSViewer = pdfjsLib;
    pageContainerUnique = {
        width: 0 as number,
        height: 0 as number,
        element: null as HTMLElement,
        canvas: null as HTMLCanvasElement,
        textContainer: null as HTMLElement,
        canvasWrapper: null as HTMLElement
    }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private file:File
    // public navCtrl: NavController,
    // public navParam: NavParams,
  ) { 
    this.book = this.router.getCurrentNavigation().extras.state;    
  }

  ngOnInit() {
    const url = this.tempFile.nativeURL.substring(0,this.tempFile.nativeURL.lastIndexOf('/')+1);;
    const name = this.tempFile.name;
    this.render(url,name);
  }

  async render(DIRECTORY_URL,FILENAME){
    
    this.file.readAsArrayBuffer(DIRECTORY_URL, FILENAME).then(async function(arraybuffer) { //DIRECTORY_URL starts with file://
      var uInt8Arr = new Uint8Array(arraybuffer);
      let pdf = await pdfjsLib.getDocument(uInt8Arr).promise
      
      var canvasParent = document.getElementById("canvasParent");
        
      for(let i = 1;i<=pdf.numPages;i++) {
        console.log(`check, ${i}`, + new Date())
        
        let page = await pdf.getPage(i)

        var canvas = <HTMLCanvasElement>  document.createElement(`canvas`);
        canvas.id = `canvas${i}`
        var ioncard = document.createElement('iom-card');
        ioncard.className = 'canvasCard';
        ioncard.appendChild(canvas);
        canvasParent.appendChild(ioncard)
        console.log(canvas)
        var context = canvas.getContext('2d');
        var viewport = page.getViewport({scale: 1});
        canvas.width = viewport.width;
        canvas.height = viewport.height
        page.render({
          canvasContext: context,
          viewport: viewport
        })
        console.log(`success, ${i}`, + new Date())
      }
      
    }, function(error){
      console.log("Load array buffer error:" + error.message);
    });
  }

  renderPdf(pdf){
    let totalPages = pdf.numPages;
    console.log(pdf.numPages)
    return pdf.getPage(1)
    .then(page=>{
      return this.renderOnePage(page)
    })
  }

    async renderOnePage(pdfPage: PDFPageProxy) {

      let canvas: HTMLCanvasElement;
      let wrapper: HTMLElement;

      let canvasContext: CanvasRenderingContext2D;
      let page: HTMLElement

      page = this.pageContainerUnique.element;
      canvas = this.pageContainerUnique.canvas;
      wrapper = this.pageContainerUnique.canvasWrapper;

      canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvasContext.imageSmoothingEnabled = false;

      let viewport = pdfPage.getViewport({scale:0.9}) as PDFPageViewport;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.style.width = `${viewport.width}px`;
      page.style.height = `${viewport.height}px`;
      wrapper.style.width = `${viewport.width}px`;
      wrapper.style.height = `${viewport.height}px`;

      //fix for 4K


      if (window.devicePixelRatio > 1) {
          let canvasWidth = canvas.width;
          let canvasHeight = canvas.height;

          canvas.width = canvasWidth * window.devicePixelRatio;
          canvas.height = canvasHeight * window.devicePixelRatio;
          canvas.style.width = canvasWidth + "px";
          canvas.style.height = canvasHeight + "px";

          canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      // THIS RENDERS THE PAGE !!!!!!


      let renderTask: PDFRenderTask = pdfPage.render({
          canvasContext,
          viewport
      });
  }
}