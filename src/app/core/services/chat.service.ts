import { IChat, IMessage } from './../interfaces/ichat';
import { UserService } from './user.service';
import { concatMap, map, Observable, take } from 'rxjs';
import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { IProfileUser } from '../interfaces/iprofile-user';
import { FormControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  chatListControl = new FormControl();

  constructor(private _Firestore : Firestore, private _UserService : UserService) { }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  createChat(otherUser: IProfileUser): Observable<string> {
    const chatsRef = collection(this._Firestore, "chats");
    // Create a reference to the "chats" collection in Firestore to which the chat will be added

    return this._UserService.currentUserProfile$.pipe(
      // Use the currentUser() method from the _UserService, which returns an Observable of the current user
      // This is wrapped in a pipe to transform the observable
  
      take(1),
      // Take only the first value emitted by the currentUser observable (i.e., the currently logged-in user)
      // Ensures the observable completes after the first value is received
  
      concatMap(user => 
        // Once the current user is obtained, use concatMap to perform the chat creation operation
        // concatMap waits for the previous observable (user) to complete before moving on to the next operation
  
        addDoc(chatsRef, {
          // Add a new document to the "chats" collection using addDoc (Firestore's method to add a document)
          // This returns a promise containing the reference to the newly created document (chat)
  
          userIds: [user?.uid, otherUser?.uid], 
          // Store the user IDs of both the current user and the other user (in the chat)
  
          users: [
            {
              displayName: user?.displayName ?? "",
              // Store the current user's displayName, default to an empty string if it's null or undefined
  
              photoURL: user?.photoURL ?? "",
              // Store the current user's photoURL, default to an empty string if it's null or undefined
            },
            {
              displayName: otherUser?.displayName ?? "",
              // Store the other user's displayName, default to an empty string if it's null or undefined
  
              photoURL: otherUser?.photoURL ?? "",
              // Store the other user's photoURL, default to an empty string if it's null or undefined
            }
          ]
          // The 'users' field contains essential profile info (displayName, photoURL) of both the current user and the other user
        })
      ),
  
      map(chatsRef => chatsRef.id)
      // Map the reference returned from addDoc to extract the chat document's unique ID (chat ID)
      // This ID will be returned as an Observable of type string
    );
  }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  get myChats$() : Observable<IChat[]>{
    const ref = collection(this._Firestore, 'chats');

    return this._UserService.currentUserProfile$.pipe(
      concatMap((user) => {
        console.log(user);
        const myQuery = query(ref, where('userIds', 'array-contains', user?.uid)); // Creates a QueryFieldFilterConstraint that enforces that documents must contain the specified field and that the value should satisfy the relation constraint provided.
        return collectionData(myQuery, { idField : 'id' }).pipe(
          map(chat => this.addChatNameAndPic(user?.uid ?? "", chat as IChat[]))
        )
      })
    );
  }

  addChatNameAndPic(currentUserId : string, chats : IChat[]) : IChat[]{
    chats.forEach(chat => {
      const otherUserIndex = chat.userIds.indexOf(currentUserId) === 1 ? 0 : 1;
      const { displayName, photoURL} = chat.users[otherUserIndex];
      chat.chatName = displayName;
      chat.chatPic = photoURL;
    })
    return chats;
  }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  isChatExist(otherUserId : string) : Observable<string | null>{
    return this.myChats$.pipe(
      take(1),
      map(chats => {
        for(let i = 0 ; i < chats.length ; i++){
          if(chats[i].userIds.includes(otherUserId)){
            return chats[i].id;
          }
        }
        return null;
      })
    );
  }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  addChatMessage(chatId : string, message : string) : Observable<any>{
    const messagesRef = collection(this._Firestore, 'chats', chatId, 'messages'); // collection => Gets a CollectionReference instance that refers to the collection at the specified absolute path.

    const chatDocRef = doc(this._Firestore, 'chats', chatId); // Gets a DocumentReference instance that refers to the document at the specified absolute path.
    const today = Timestamp.fromDate(new Date());
    return this._UserService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) => addDoc(messagesRef, {
          text : message,
          senderId : user?.uid,
          sentDate : today,
        })
      ),
      concatMap(() => updateDoc(chatDocRef, {lastMessage: message, lastMessageDate: today})),
    );
  }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  getChatMessages$(chatId : string) : Observable<IMessage[]>{
    const messagesRef = collection(this._Firestore, 'chats', chatId, 'messages');
    const Query = query(messagesRef, orderBy('sentDate','asc'));
    return collectionData(Query) as Observable<IMessage[]>;
  }

}
