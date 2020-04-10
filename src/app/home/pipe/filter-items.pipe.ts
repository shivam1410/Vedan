import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItems'
})
export class FilterItemsPipe implements PipeTransform {

  transform(objects: any[], item: "file" | "directory"): any {
      return objects.filter(object => {
        if(item == 'directory')
        {
          return object.isDirectory == true
        }
        if(item == 'file')
        {
          return object.isFile == true
        }
      });
  }
}
