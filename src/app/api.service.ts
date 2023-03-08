import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Client, Databases, ID, Models } from 'appwrite';
import { catchError, EMPTY, from, map, Observable, of, switchMap } from 'rxjs';
import { EventModel, UserModel } from './state/store.service';

import { environment } from 'src/environment';
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

  private client = new Client().setEndpoint(environment.APPWRITE_URL) // Your API Endpoint
                               .setProject(environment.APPWRITE_PROJECTID);               // Your project ID

  private databaseId = environment.APPWRITE_DATABASEID;
  private eventCollectionId = environment.APPWRITE_EVENTSSCOLLECTIONID;
  private usersCollectionId = environment.APPWRITE_USERSCOLLECTIONID;
  private certificateAPIURL = environment.CERTIFICATEAPI_URL;


  constructor(private httpClient: HttpClient) { }

  currentSession(): Observable<AdminSession> {
    const account = new Account(this.client);
    
    return from(account.getSession("current")).pipe(catchError((err) => {
      return EMPTY;
    }),switchMap(((session: Models.Session) => {

      return from(account.getPrefs()).pipe(switchMap((prefs: Models.Preferences) => {
        const adminSession: AdminSession = {
          userId: session.userId, prefs
        }

        return of(adminSession);
      }))
    })));
  }

  adminLogout(): Observable<{}> {
    const account = new Account(this.client);
    return from(account.getSession("current")).pipe(switchMap((session: Models.Session) => from(account.deleteSession(session.$id))));
  }

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

  createUser(user: UserModel): Observable<UserModel> {
    const databases = new Databases(this.client);
    const object : Partial<UserModel> = user;
    delete object.userId
    
    return from(databases.createDocument(this.databaseId, this.usersCollectionId, ID.unique(), object)).pipe(map((model: Models.Document) => {
      const user: UserModel = {
        userId: model.$id,
        firstName: model["firstName"],
        lastName: model["lastName"],
        email: model["email"]
      };

      return user;
    }));
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

    
    if(members.join("").trim().length === 0) {
      return EMPTY;
    }

    return from(databases.updateDocument(this.databaseId, this.eventCollectionId, event.eventId, { name, members })).pipe(map((value => {
      const updatedModel: EventModel = {
        name: value["name"],
        eventId: value.$id,
        members: value["members"]
      }

      return updatedModel;
    })))
  }

  getCertificate(userId: string, eventId: string) {
    return this.httpClient.post(this.certificateAPIURL, { userId, eventId }, { responseType: "arraybuffer"  });
  }
}
