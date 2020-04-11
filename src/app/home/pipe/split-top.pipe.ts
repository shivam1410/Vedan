import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitTop'
})
export class SplitTopPipe implements PipeTransform {

  transform(val: string, op: string): string {
    const arr = val.split(op)
    if(val){
      return arr[arr.length-1];
    }
    else return 'internal';
  }
}
