import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { QRCodeModule } from 'angularx-qrcode';
import { InfiniteTypeDeleteModule } from "ngx-sbz-type-delete";

const routes: Routes = [{
  path: "login",
  component: LoginComponent
}, {
  path: "",
  component: HomeComponent
}];


@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    QRCodeModule,
    InfiniteTypeDeleteModule
  ]
})
export class V2AppModule { }
