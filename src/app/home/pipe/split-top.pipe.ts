import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitTop'
})
export class SplitTopPipe implements PipeTransform {

  transform(val: string, op: string): string {
    const arr = val.split(op)
    return arr[arr.length-1];
  }
}
