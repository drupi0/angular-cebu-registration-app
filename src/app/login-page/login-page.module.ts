import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AccountDataComponent } from './account-data/account-data.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginPageRoutingModule } from './login-page-routing.module';
import { LoginPageComponent } from './login-page.component';
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
  declarations: [
    LoginFormComponent,
    LoginPageComponent,
    AccountDataComponent
  ],
  imports: [
    CommonModule,
    LoginPageRoutingModule,
     BsDropdownModule.forRoot(),
     AlertModule.forRoot(),
     FormsModule
  ]
})
export class LoginPageModule { }
