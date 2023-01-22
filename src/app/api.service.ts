import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ActionTypes, User } from './state/store.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  readonly BASE_URL = ""
  constructor(private httpClient: HttpClient) { }

  getUser(registrationId: String) : Observable<User> {
    return this.httpClient.post(this.BASE_URL.concat("users"), {
      registrationId
    }) as Observable<User>;
  }

  updateUser(user: User, actionType: ActionTypes) : Observable<User> {
    return this.httpClient.post(this.BASE_URL.concat("users"), { user, actionType }) as Observable<User>;
  }

  getEvents(auth: string) : Observable<Event[]> {
    return this.httpClient.post(this.BASE_URL.concat("events"), {
      auth
    }) as Observable<Event[]>;
  }

  updateEventMembers(event: Event)  : Observable<Event> {
    return this.httpClient.post(this.BASE_URL.concat("events"), { event }) as Observable<Event>;
  }

  getCertificate(eventId: string) {
    return this.httpClient.post(this.BASE_URL.concat("certificate"), { eventId }) as Observable<Event>;
  }
}
