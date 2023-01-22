import { EffectService } from 'src/app/state/effect.service';
import { User } from 'src/app/state/store.service';

import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-account-data',
  templateUrl: './account-data.component.html',
  styleUrls: ['./account-data.component.scss']
})
export class AccountDataComponent {
  @Input("user") user: User = {} as User;

  logout() {
    this.effect.clearUser();
  }

  join() {
    this.effect.joinEvent();
  }

  printCertificate() {
    this.effect.printCertificate();
  }

  select(eventId: string) {
    
  }

  constructor(public effect: EffectService){}
}
