import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export interface AppState {
  eventDetails: EventModel[],
  user: UserModel[]
}

export enum ActionTypes {
  ADD_USER = "[USER] Add User",
  UPDATE_USER = "[USER] Update User",
  ADD_EVENT = "[EVENT] Add Event",
  UPDATE_EVENT_PARTICIPANTS = "[EVENT] Update Event Participants"
}

interface Action {
  type: ActionTypes,
  state: Partial<AppState>
}

export interface UserModel {
  userId: string,
  firstName: string,
  lastName: string,
  email: string
}

export interface EventModel {
  name: string,
  eventId: string,
  members: string[]
}

const initialState: AppState = { eventDetails: [], user: [] };

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private state: AppState = initialState;
  private stateSubject: BehaviorSubject<AppState> = new BehaviorSubject({} as AppState);

  constructor() { }

  get _state() {
    return this.stateSubject.asObservable();
  }

  events() : Observable<EventModel[]> {
    return this._state.pipe(map((state: AppState) => {
      if(!state.eventDetails) {
        return [];
      }

      return state.eventDetails;
    }))
  }

  users() : Observable<UserModel[]> {
    return this._state.pipe(map((state: AppState) => {
      if(!state.user) {
        return [];
      }

      return state.user;
    }))
  }

  dispatch(action: Action) {
    switch (action.type) {
      case ActionTypes.ADD_USER:
        if (action.state.user) {
          this.state.user = [...this.state.user, ...action.state.user];
        }
        break;
      case ActionTypes.UPDATE_USER:
        if (action.state.user) {
          action.state.user.forEach((user: UserModel) => {

            const userIndex = this.state.user.findIndex((stateUser: UserModel) => stateUser.userId === user.userId);

            if (userIndex !== -1) {
              this.state.user[userIndex] = user;
            }
          })
        }
        break;
      case ActionTypes.ADD_EVENT:
        if (action.state.eventDetails) {
          this.state.eventDetails = [...this.state.eventDetails, ...action.state.eventDetails];
        }
        break;
      case ActionTypes.UPDATE_EVENT_PARTICIPANTS:
        if (action.state.eventDetails) {
          action.state.eventDetails.forEach((event: EventModel) => {
            const eventIndex = this.state.eventDetails.findIndex((stateEvent: EventModel) => stateEvent.eventId === event.eventId);

            if (eventIndex !== -1) {
              event.members.forEach((memberId: string) => {
                if (!this.state.eventDetails[eventIndex].members.find((stateMemberId: string) => stateMemberId === memberId)) {
                  this.state.eventDetails[eventIndex].members.push(memberId);
                }
              })

            }
          })
        }
        break;
    }

    this.stateSubject.next(this.state);
  }
}
