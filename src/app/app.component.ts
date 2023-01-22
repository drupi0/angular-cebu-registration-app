import { Component } from '@angular/core';

import { EffectService } from './state/effect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public effect: EffectService) {}


}
