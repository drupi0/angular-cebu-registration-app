import { EffectService } from 'src/app/state/effect.service';
import { UserModel, EventModel } from 'src/app/state/store.service';

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';

@Component({
  selector: 'ngx-account-data',
  templateUrl: './account-data.component.html',
  styleUrls: ['./account-data.component.scss']
})
export class AccountDataComponent implements OnInit {
  @Input("user") user: UserModel = {} as UserModel;

  ngOnInit() {
    this.effect.getEvents().subscribe();
  }

  logout() {
    this.effect.clearUser();
    // this.effect.clearCurrentEvent();
  }

  join(event: EventModel) {
    this.effect.joinEvent(event);
  }

  printCertificate(event: EventModel) {
    this.effect.printCertificate(event);
  }

  select(eventId: string) {
    this.effect.setEvent(eventId)
  }

  hasJoined(event: EventModel): boolean {
    return event.members.some(memberId => memberId === this.user.userId);
  }


  constructor(public effect: EffectService){}
}
