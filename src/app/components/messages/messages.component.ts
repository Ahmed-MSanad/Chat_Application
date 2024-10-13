import { AsyncPipe, NgClass } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { combineLatest, map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomFirebaseDatePipe } from '../../core/pipes/custom-firebase-date.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { MatListItemIcon, MatListModule } from '@angular/material/list'
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { IChat, IMessage } from '../../core/interfaces/ichat';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    CustomFirebaseDatePipe,
    ReactiveFormsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatListItemIcon,
    MatInputModule,
    MatAutocompleteModule,
    MatListModule,
    MatOptionModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnDestroy{
  private readonly _AngularFireAuth = inject(AngularFireAuth);
  readonly _ChatService = inject(ChatService);
  
  userChats$ = this._ChatService.myChats$;
  currentChat$ ! : Observable<IChat | undefined>;
  currentChatMessages$ ! : Observable<IMessage[]>;
  selectedChat$ ! : Observable<IChat | undefined>;
  chatMessages$ ! : IMessage[];
  
  currentUser : firebase.User | null = null;
  messageControl = new FormControl('');

  authStateUnsubscribe ! : Subscription;
  addChatMessageUnsubscribe ! : Subscription;

ngOnInit(): void {
    this.authStateUnsubscribe = this._AngularFireAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });


    // 1)📝📝 chat message header => chatted_with_user_photo | chatted_with_user_name ==> start 🔥
    // 2)📝📝 chat messages => your_and_chatted_with_user_messages ==> start 🔥
    if(this._ChatService.chatListControl?.value){
        this.currentChat$ = this.userChats$.pipe(
          // value => is an array of the selected chats we get from the <mat-selection-list> and as we sat the multiple="false" so the returned array will contain only 1 selected chat which the user will select
          map((chats) => {return chats.find(c => c.id === this._ChatService.chatListControl?.value[0]);}),
        );
    
        this.currentChatMessages$ = this._ChatService.getChatMessages$(this._ChatService.chatListControl?.value[0]).pipe(
          tap(()=>{
            this.scrollToTheEndOfTheChat();
          })
        )
    }
    // 1)📝📝 chat message header => chatted_with_user_photo | chatted_with_user_name ==> end 💀
    // 2)📝📝 chat messages => your_and_chatted_with_user_messages ==> end 💀


    // 1)📝📝 chat message header => chatted_with_user_photo | chatted_with_user_name ==> start 🔥
    this.selectedChat$ = combineLatest([
      this._ChatService.chatListControl.valueChanges,
      this.userChats$
    ]).pipe(
      // value => is an array of the selected chats we get from the <mat-selection-list> and as we sat the multiple="false" so the returned array will contain only 1 selected chat which the user will select
      map(([value, chats]) => {return chats.find(c => c.id === value[0]);}),
    );
    // 1)📝📝 chat message header => chatted_with_user_photo | chatted_with_user_name ==> end 💀



    // 2)📝📝 chat messages => your_and_chatted_with_user_messages ==> start 🔥
    this._ChatService.chatListControl.valueChanges.pipe(
      map(value => value[0]),
      switchMap((chatId) => {
        console.log("change happened");
        return this._ChatService.getChatMessages$(chatId);
      }),
      tap(()=>{
        this.scrollToTheEndOfTheChat();
      })
    ).subscribe((res) => {this.chatMessages$ = res;});
    // 2)📝📝 chat messages => your_and_chatted_with_user_messages ==> end 💀

} // 🔺🔺🔺 end of the ngOnInit 🔺🔺🔺



// 3)📝📝 chat messages send => input_message_field | submit_message_button ==> start 🔥
  sendMessage(){
    const message = this.messageControl?.value;
    const selectedChatId = this._ChatService.chatListControl?.value;

    if(message && selectedChatId){
      this.addChatMessageUnsubscribe = this._ChatService.addChatMessage(selectedChatId[0],message).subscribe(()=>{
        this.scrollToTheEndOfTheChat();
      });
      this.messageControl.setValue("");
    }
  }
// 3)📝📝 chat messages send => input_message_field | submit_message_button ==> end 💀


// when new message is sent we need it to automatically scroll to the new message
  @ViewChild('endOfChat') endOfChat ! : ElementRef;
  scrollToTheEndOfTheChat(){
    setTimeout(() => {
      if(this.endOfChat){
        this.endOfChat.nativeElement.scrollIntoView({behavior : "smooth"})
      }
    }, 100);
  }



  ngOnDestroy(): void {
      this.chatMessages$ = [];
      this._ChatService.chatListControl?.setValue(["a"]);
      this.authStateUnsubscribe?.unsubscribe();
      this.addChatMessageUnsubscribe?.unsubscribe();
  }

}
