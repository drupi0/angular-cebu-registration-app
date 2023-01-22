import {
    BehaviorSubject, catchError, EMPTY, filter, map, Observable, of, Subject, switchMap, take, tap
} from 'rxjs';

import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { ActionTypes, Event, StoreService, User } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  errorSubject: Subject<string> = new Subject();
  currentUser: BehaviorSubject<User> = new BehaviorSubject({} as User);

  clearError() {
    this.errorSubject.next("");
  }

  clearUser() {
    this.currentUser.next({} as User);
  }

  registrationIdLookup(registrationId: string) {

    this.store.users().pipe(take(1), tap(i => console.log(i)), switchMap((users: User[]) => {

      const userIndex = users.findIndex(user => user.userId === registrationId);

      console.log(userIndex);

      if(userIndex === -1) {
        return this.registrationApiLookup().pipe(switchMap((user: User) => {
          this.store.dispatch({
            type: ActionTypes.ADD_USER,
            state: {
              user: [user]
            }
          });

          return of(user);
        }));
      }

      return of(users[userIndex]);

    })).subscribe((user: User) => {
      this.currentUser.next(user);
    })
  }

  joinEvent() {

  }

  printCertificate() {

  }

  getEvents(): Observable<Event[]> {
    return this.store.events().pipe(take(1), switchMap((stateEvents: Event[]) => {
      if(!stateEvents.length) {
        return this.getEventsFromApi().pipe(switchMap((events: Event[]) => {

          this.store.dispatch({
            type: ActionTypes.ADD_EVENT,
            state: {
              eventDetails: events
            }
          });

          return of(events);
        }));
      }
      return of(stateEvents);
    }))
  }

  private getEventsFromApi(): Observable<Event[]> {
    return of([{
      name: "Angular Meetup",
      eventId: "1234567",
      members: []
    }, 
    {
      name: "TEST Meetup",
      eventId: "123456",
      members: []
    }]).pipe(catchError((err: { message: string }, caught) => {
      
      if(err) {
        this.errorSubject.next(err.message);
      }

      return caught;
      
    }));
  }
  

  private registrationApiLookup(): Observable<User> {
    return of({
      firstName: "Cyrus",
      lastName: "Zandro",
      email: "czhiyas@gmail.com",
      userId: "123456"
    } as User).pipe(catchError((err: { message: string }, caught) => {
      
      if(err) {
        this.errorSubject.next(err.message);
      }

      return caught;
      
    }));
  }

  constructor(private apiService: ApiService, private store: StoreService) { }
}
