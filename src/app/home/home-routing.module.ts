import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CopyComponent } from './copy/copy.component';

const routes: Routes = [
  // {path: 'copy', component: CopyComponent},
  // {path: 'copy/:folder', component: CopyComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
