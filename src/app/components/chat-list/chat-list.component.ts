import { IProfileUser } from './../../core/interfaces/iprofile-user';
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FilterUsersPipe } from '../../core/pipes/filter-users-pipe.pipe';
import { UserService } from '../../core/services/user.service';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ChatService } from '../../core/services/chat.service';
import { map, Observable, of, Subscription, switchMap } from 'rxjs';
import { MatListItemAvatar, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatLineModule } from '@angular/material/core';
import { CustomFirebaseDatePipe } from '../../core/pipes/custom-firebase-date.pipe';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterModule } from '@angular/router';
import { IChat } from '../../core/interfaces/ichat';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteModule,
    AsyncPipe,
    FilterUsersPipe,
    MatSelectionList,
    MatDivider,
    MatListOption,
    MatListItemAvatar,
    MatLineModule,
    CustomFirebaseDatePipe,
    RouterModule,
  ],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnInit, OnDestroy{
  private readonly _AngularFireAuth = inject(AngularFireAuth);
  private readonly _BreakpointObserver = inject(BreakpointObserver);
  private readonly _Router = inject(Router);
  readonly _UserService = inject(UserService);
  readonly _ChatService = inject(ChatService);

  userChats$ : Observable<IChat[]> = this._ChatService.myChats$; // chats of the currently logged in user.
  isLargeScreen$ !: Observable<boolean>;

  searchControl = new FormControl('');
  allUsers ! : IProfileUser[];
  currentUser : firebase.User | null = null;

  allUsersUnsubscribe ! : Subscription;
  authStateUnsubscribe ! : Subscription;
  createChatUnsubscribe ! : Subscription;


  ngOnInit(): void {
      this.allUsersUnsubscribe = this._UserService.allUsers.subscribe((users) => {
        this.allUsers = users;
      })

      this.authStateUnsubscribe = this._AngularFireAuth.authState.subscribe((user) => {
        if (user) {
          this.currentUser = user;
        }
      });

      this.isLargeScreen$ = this._BreakpointObserver.observe(['(min-width: 1024px)'])
        .pipe(map(result => result.matches));
  }

  
// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
  
  createChat(otherUser : IProfileUser){
      this.createChatUnsubscribe = this._ChatService.isChatExist(otherUser?.uid).pipe(
        switchMap((chatId) => {
          if(chatId){
            return of(chatId);
          }
          else{
            return this._ChatService.createChat(otherUser);
          }
        })
      ).subscribe(chatId => {
        this._ChatService.chatListControl.setValue([chatId]);
        this.isLargeScreen$.subscribe(result => result ? null : this._Router.navigate(['/messages']));
      });
  }

// 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

  ngOnDestroy(){
      this.allUsersUnsubscribe?.unsubscribe();
      this.authStateUnsubscribe?.unsubscribe();
      this.createChatUnsubscribe?.unsubscribe();
  }
}
