import { Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { from, Observable, of, switchMap } from 'rxjs';
import { IProfileUser } from '../interfaces/iprofile-user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private _Firestore:Firestore, private _AuthService : AuthService) { }

  get currentUserProfile$(): Observable<IProfileUser | null> {
    return this._AuthService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          console.log("we are here");
          return of(null); // If the user is not authenticated, return null
        }
  
        // Reference to the Firestore document for the user
        const ref = doc(this._Firestore, 'users', user.uid);
  
        // Check if the user profile exists
        return docData(ref).pipe(
          switchMap((profile) => {
            if (profile) {
              // If the user profile exists, return it
              return of(profile as IProfileUser);
            } else {
              // If the user profile does not exist, create it
              this.createUser(user);
              return docData(ref) as Observable<IProfileUser>;
            }
          })
        );
      })
    );
  }
  
  
/* ----------####----------####----------####----------####----------####----------####----------####----------####----------####---------- */

  // This is a valid approach to retrieve all user documents from the Firestore users collection as an observable stream,
  // where each user is expected to match the IProfileUser type. If you wanted to refine the query (e.g., filter users),
  // you could add conditions to the query function.
  get allUsers(): Observable<IProfileUser[]> {
    // Step 1: Create a reference to the 'users' collection in Firestore
    const ref = collection(this._Firestore, 'users'); 
  
    // Step 2: Create a Firestore query object. In this case, we are querying
    // all documents in the 'users' collection. The 'query' function is used
    // to construct a query, but here, it doesn’t have any specific filters.
    const queryAll = query(ref);
  
    // Step 3: Use the 'collectionData' function to fetch the data from Firestore.
    // This returns an observable that emits the collection data.
    // The 'as Observable<IProfileUser[]>' part is a type assertion that tells TypeScript 
    // we expect the data to match the IProfileUser[] type.
    return collectionData(queryAll) as Observable<IProfileUser[]>;
  }

/* ----------####----------####----------####----------####----------####----------####----------####----------####----------####---------- */

  createUser(user: IProfileUser): Observable<void> {
    // Create a reference to a specific document in the 'users' collection, with the document ID being the user's uid
    const userDocRef = doc(this._Firestore, `users/${user.uid}`);
    // Return an Observable wrapping the 'setDoc' promise, allowing you to handle success or errors
    return from(setDoc(userDocRef, {
      displayName: user.displayName,  // Store user's display name
      photoURL: user.photoURL,        // Store user's profile picture URL
      uid: user.uid                   // Store user's unique ID (uid), though it's already the document ID
    }));
  }

/* ----------####----------####----------####----------####----------####----------####----------####----------####----------####---------- */

  updateUserProfile(userId: string | undefined, updatedData: { displayName?: string, photoURL?: string }): Observable<void> {
    // Create a reference to the user's document in the 'users' collection using their user ID (uid)
    const userDocRef = doc(this._Firestore, `users/${userId}`);

    // Update the Firestore document with the new display name and/or photo URL
    return from(updateDoc(userDocRef, updatedData));
  }
}
