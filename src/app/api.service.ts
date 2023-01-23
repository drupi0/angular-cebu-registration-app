import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ActionTypes, EventModel, UserModel } from './state/store.service';
import { EMPTY, first, from, map, Observable, of, switchMap, take } from 'rxjs';
import { Client, Account, ID, Models, Databases, Query } from 'appwrite';

export interface AdminSession {
  userId: string,
  prefs: {
    isAdmin?: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private client = new Client().setEndpoint('http://localhost/v1') // Your API Endpoint
    .setProject('63ce0b5c67186021e6e1');               // Your project ID
  private databaseId = "63ce0b9bcaa3a8554018";
  private eventCollectionId = "63ce219d78997997e9a6";
  private usersCollectionId = "63ce0e0b5505a6c98a09";

  private BASE_URL = "";

  constructor(private httpClient: HttpClient) { }

  adminLogin(email: string, password: string): Observable<AdminSession> {
    const account = new Account(this.client);

    return from(account.createEmailSession(email, password)).pipe(switchMap(((session: Models.Session) => {

      return from(account.getPrefs()).pipe(switchMap((prefs: Models.Preferences) => {
        const adminSession: AdminSession = {
          userId: session.userId, prefs
        }

        return of(adminSession);
      }))
    })))
  }

  getUser(registrationId: string): Observable<UserModel> {
    const databases = new Databases(this.client);

    return from(databases.getDocument(this.databaseId, this.usersCollectionId, registrationId)).pipe(map((model: Models.Document) => {
      const user: UserModel = {
        userId: model.$id,
        firstName: model["firstName"],
        lastName: model["lastName"],
        email: model["email"]
      };

      return user;
    }));
  }

  updateUser(user: UserModel, actionType: ActionTypes): Observable<UserModel> {
    return this.httpClient.post(this.BASE_URL.concat("users"), { user, actionType }) as Observable<UserModel>;
  }

  getEvents(): Observable<EventModel[]> {
    const databases = new Databases(this.client);

    return from(databases.listDocuments(this.databaseId, this.eventCollectionId)).pipe(map((response: Models.DocumentList<Models.Document>) => {

      const eventDetails: EventModel[] = response.documents.reduce((acc: EventModel[], current: Models.Document) => {
        acc.push({
          eventId: current.$id,
          name: current["name"],
          members: current["members"]
        });

        return acc
      }, [] as EventModel[])

      
      return eventDetails;
    }));
  }

  updateEventMembers(event: EventModel): Observable<EventModel> {
    const databases = new Databases(this.client);

    const { name, members } = event;

    return from(databases.updateDocument(this.databaseId, this.eventCollectionId, event.eventId, { name, members })).pipe(map((value => {
      const updatedModel: EventModel = {
        name: value["name"],
        eventId: value.$id,
        members: value["members"]
      }

      return updatedModel;
    })))
  }

  getCertificate(eventId: string) {
    return this.httpClient.post(this.BASE_URL.concat("certificate"), { eventId }) as Observable<Event>;
  }
}
