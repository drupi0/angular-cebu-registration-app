import {
    BehaviorSubject, catchError, EMPTY, filter, map, Observable, of, Subject, switchMap, take, tap
} from 'rxjs';

import { Injectable } from '@angular/core';

import { AdminSession, ApiService } from '../api.service';
import { ActionTypes, AppState, EventModel, StoreService, UserModel } from './store.service';
import { Models } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  errorSubject: Subject<string> = new Subject();
  private _currentUser: BehaviorSubject<UserModel> = new BehaviorSubject({} as UserModel);
  private _currentEvent: BehaviorSubject<EventModel> = new BehaviorSubject({} as EventModel);
  private _adminAuth: BehaviorSubject<AdminSession> = new BehaviorSubject({} as AdminSession);

  get currentUser(): Observable<UserModel> {
    return this._currentUser.asObservable();
  }

  get session(): Observable<AdminSession> {
    return this._adminAuth.asObservable();
  }

  get events(): Observable<EventModel[]>{
    return this.store._state.pipe(map((state: AppState) => state.eventDetails));
  }

  loginAdmin(email: string, password: string) {
    this.apiService.adminLogin(email, password).pipe(catchError((err) => {

      this.errorSubject.next(err);

      return EMPTY;
    })).subscribe((session: AdminSession) => {
      console.log(typeof session.prefs.isAdmin);

      if(!session.prefs.isAdmin || session.prefs.isAdmin !== "true") {
        
        this.errorSubject.next("Account does not have admin access.");

        return;
      }
      
      this._adminAuth.next(session);
      this.clearError();
    })
  }

  logOutAdmin() {
    this._adminAuth.next({} as AdminSession);
  }
  
  clearError() {
    this.errorSubject.next("");
  }

  clearUser() {
    this._currentUser.next({} as UserModel);
  }

  clearCurrentEvent() {
    this._currentEvent.next({} as EventModel);
  }

  setUser(user: UserModel) {
    this._currentUser.next(user)
  }

  registrationIdLookup(registrationId: string) {
    this.store.users().pipe(take(1), switchMap((users: UserModel[]) => {
      const userIndex = users.findIndex(user => user.userId === registrationId);

      if(userIndex === -1) {
        return this.registrationApiLookup(registrationId).pipe(switchMap((user: UserModel) => {
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

    })).subscribe((user: UserModel) => {
      this._currentUser.next(user);
      this.errorSubject.next("");
    })
  }

  setEvent(eventId: string) {
    this.store.events().pipe(take(1), switchMap((events: EventModel[]) => {
      const foundEvent = events.find((event: EventModel) => event.eventId === eventId);

      if(foundEvent) {
        return of(foundEvent);
      }

      return EMPTY;

    })).subscribe((event: EventModel) => {
      this._currentEvent.next(event);
    })
    
  }

  get currentEvent(): Observable<EventModel> {
    return this._currentEvent.asObservable();
  }



  

  joinEvent(event: EventModel) {
    event.members.push(this._currentUser.getValue().userId);

    this.apiService.updateEventMembers(event).pipe(tap((updatedEvent: EventModel) => {
      this.store.dispatch({
        type: ActionTypes.UPDATE_EVENT_PARTICIPANTS,
        state: {
          eventDetails: [updatedEvent]
        }
      });
    })).subscribe();
  }

  printCertificate(event: EventModel) {

  }

  getEvents(): Observable<EventModel[]> {
    return this.store.events().pipe(take(1), switchMap((stateEvents: EventModel[]) => {
      if(!stateEvents.length) {
        return this.getEventsFromApi().pipe(switchMap((events: EventModel[]) => {

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

  private getEventsFromApi(): Observable<EventModel[]> {
    return this.apiService.getEvents().pipe(catchError((err: { message: string }, caught) => {
      
      if(err) {
        this.errorSubject.next(err.message);
      }

      return caught;
      
    }));
  }
  

  private registrationApiLookup(registrationId: string): Observable<UserModel> {
    return this.apiService.getUser(registrationId).pipe(catchError((err: { message: string }) => {
      if(err) {
        this.errorSubject.next(err.message);
      }
      return EMPTY;
      
    }));
  }

  constructor(private apiService: ApiService, private store: StoreService) { }
}
