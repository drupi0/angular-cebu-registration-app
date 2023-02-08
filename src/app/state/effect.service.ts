import {
  BehaviorSubject, catchError, EMPTY, map, Observable, of, Subject, switchMap, take, tap
} from 'rxjs';

import { Injectable } from '@angular/core';

import { AdminSession, ApiService } from '../api.service';
import { ActionTypes, AppState, EventModel, StoreService, UserModel } from './store.service';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  errorSubject: Subject<string> = new Subject();
  loadingSubject: Subject<boolean> = new Subject();
  private _currentUser: BehaviorSubject<UserModel> = new BehaviorSubject({} as UserModel);
  private _currentEvent: BehaviorSubject<EventModel> = new BehaviorSubject({} as EventModel);
  private _adminAuth: BehaviorSubject<AdminSession> = new BehaviorSubject({} as AdminSession);

  get currentUser(): Observable<UserModel> {
    return this._currentUser.asObservable();
  }

  get session(): Observable<AdminSession> {
    return this._adminAuth.asObservable().pipe(switchMap((current: AdminSession) => {
      if(!Object.keys(current).length) {
        return this.apiService.currentSession().pipe(tap((loggedIn: AdminSession) => {
          this._adminAuth.next(loggedIn);
        }));
      }

      return of(current);
    }));
  }

  get events(): Observable<EventModel[]>{
    return this.store._state.pipe(map((state: AppState) => state.eventDetails));
  }

  loginAdmin(email: string, password: string) {
    this.showLoad();
    this.apiService.adminLogin(email, password).pipe(catchError((err) => {

      this.errorSubject.next(err);
      this.showLoad(false);

      return EMPTY;
    })).subscribe((session: AdminSession) => {
      if(!session.prefs.isAdmin || session.prefs.isAdmin !== "true") {
        this.errorSubject.next("Account does not have admin access.");
        return;
      }
      
      this._adminAuth.next(session);
      this.showLoad(false);
    })
  }

  logOutAdmin() {
    this.apiService.adminLogout().subscribe(() => {
      this._adminAuth.next({} as AdminSession);
    });
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

  private showLoad(isShown: boolean = true) {
    if(isShown) {
      this.loadingSubject.next(true);
      this.errorSubject.next("");

      return;
    }

    this.loadingSubject.next(false);
    
  }

  registrationIdLookup(registrationId: string) {
    this.showLoad();
    
    this.store.users().pipe(take(1), switchMap((users: UserModel[]) => {
      const userIndex = users.findIndex(user => user.userId === registrationId);

      if(userIndex === -1) {
        return this.registrationApiLookup(registrationId).pipe(switchMap((user: UserModel) => {

          this.store.dispatch(ActionTypes.ADD_USER, { user: [user]})

          return of(user);
        }));
      }

      return of(users[userIndex]);

    })).subscribe((user: UserModel) => {
      this._currentUser.next(user);
      this.errorSubject.next("");
      this.showLoad(false);
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

  createUser(user: Partial<UserModel>): Observable<boolean> {
    this.showLoad();
    if(user.email && user.firstName && user.lastName) {
      return this.apiService.createUser(user as UserModel).pipe(catchError((err: { message: string }) => {
        if(err) {
          this.errorSubject.next(err.message);
          this.loadingSubject.next(false);
        }

        return of({} as UserModel);
      }), switchMap((user: UserModel) => {
        
        if(!user) {
          return of(false);
        }

        this.store.dispatch(ActionTypes.ADD_USER, { user: [user] });

        this._currentUser.next(user);

        this.showLoad(false);
        return of(true);
      }));
    }

    this.showLoad(false);
    this.errorSubject.next("Incomplete user details");
    return of(false);
  }

  get currentEvent(): Observable<EventModel> {
    return this._currentEvent.asObservable();
  }


  joinEvent(event: EventModel) {
    event.members.push(this._currentUser.getValue().userId);

    this.apiService.updateEventMembers(event).pipe(tap((updatedEvent: EventModel) => {
      this.store.dispatch(ActionTypes.UPDATE_EVENT_PARTICIPANTS, { eventDetails: [updatedEvent] });
    })).subscribe();
  }

  printCertificate(event: EventModel) {
    this.showLoad();
    this.apiService.getCertificate(this._currentUser.getValue().userId, event.eventId).subscribe(file => {
      this.showLoad(false);
      const fileUrl = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }));
      window.open(fileUrl, "_blank");
    });
  }

  getEvents(): Observable<EventModel[]> {
    return this.store.events().pipe(take(1), switchMap((stateEvents: EventModel[]) => {
      if(!stateEvents.length) {
        return this.getEventsFromApi().pipe(switchMap((events: EventModel[]) => {

          this.store.dispatch(ActionTypes.ADD_EVENT, { eventDetails: events });

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
        this.loadingSubject.next(false);
      }
      return EMPTY;
      
    }));
  }

  constructor(private apiService: ApiService, private store: StoreService) { }
}
