import { EffectService } from 'src/app/state/effect.service';

import { Component } from '@angular/core';

@Component({
  selector: 'ngx-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  registrationId: string = "";

  checkCode() {
    this.effect.registrationIdLookup(this.registrationId);
  }

  clear() {
    this.registrationId = "";
    this.effect.clearError();
  }

  constructor(private effect: EffectService) {}
}
