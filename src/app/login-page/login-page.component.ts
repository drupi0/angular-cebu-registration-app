import { Component } from '@angular/core';

import { EffectService } from '../state/effect.service';

@Component({
  selector: 'ngx-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  constructor(public effect: EffectService){}
}
