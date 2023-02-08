import { EffectService } from 'src/app/state/effect.service';

import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/state/store.service';

@Component({
  selector: 'ngx-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  registrationId: string = "";
  isAdminLoginShown: boolean = false;
  isLoggedInAsAdmin: boolean = false;
  isUserFormHidden: boolean = true;
  newUser: Partial<UserModel> = {
    firstName: "",
    lastName: "",
    email: ""
  };

  admin: {
    email: string,
    password: string
  } = { email: "", password: "" }

  ngOnInit(): void {
    this.effect.session.subscribe(session => {
      console.log(session);
      
      if (session.prefs && session.prefs.isAdmin === "true") {
        this.isLoggedInAsAdmin = true;
        this.hideAdmin();
      }
    });
  }

  checkCode() {
    this.effect.registrationIdLookup(this.registrationId);
  }

  clear() {
    this.registrationId = "";
    this.effect.clearError();
  }

  hideAdmin() {
    this.admin = { email: "", password: "" };
    this.isAdminLoginShown = false;
  }

  adminLogin() {
    this.effect.loginAdmin(this.admin.email, this.admin.password);
  }

  adminLogOut() {
    this.effect.logOutAdmin();
    this.isLoggedInAsAdmin = false;
    this.hideAdmin();
  }

  scannedData(userId: string) {
    this.registrationId = userId;
    this.checkCode();
  }

  openUserForm(isHidden: boolean = false) {
    this.isUserFormHidden = isHidden;

    if (!isHidden) {
      this.newUser = {
        firstName: "",
        lastName: "",
        email: ""
      }
    }
  }

  createUser() {
    this.effect.createUser(this.newUser).subscribe(response => {
      this.isUserFormHidden = response;
    });
  }

  constructor(public effect: EffectService) { }
}
