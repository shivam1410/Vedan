import { Injectable, ɵɵresolveBody } from '@angular/core';
import { WebServer } from '@ionic-native/web-server/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  port = 54321;
  constructor(
    private webServer: WebServer,
    private androidPermissions: AndroidPermissions,
  ) { }

  start(){

    let bodyHtml= `<html>Local server created but not operational</html>`
    
    this.webServer.onRequest().subscribe(
      (request)=> {
        console.log("getting request: ", request);
    
        this.webServer.sendResponse(
          request.requestId,
          {
            status: 200,
            body: bodyHtml,
            headers: {
              'Content-Type': 'text/html'
            }
          }
        );
      }
    );
    return this.webServer.start(this.port)
  }

  stop(){
      this.webServer.stop()
      .catch(e=>{
        console.error(e)
        return e;
      })
      .then(d=>{
        console.log(d)
        return this.port;
      })
  }

  str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
}
