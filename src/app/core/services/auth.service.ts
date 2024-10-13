import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from, Observable, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ISigninCredentials, ISignupCredentials } from '../interfaces/isignup-credentials';
import { IProfileUser } from '../interfaces/iprofile-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _Auth:Auth, private _AngularFireAuth : AngularFireAuth) { }
  
  
  readonly isLoggedIn$ = authState(this._Auth);

// -----------------------------------------------------------------------------------------------------------------------


  get currentUser$(){
    return from(this._AngularFireAuth.currentUser) as Observable<IProfileUser | null>;
  }


// -----------------------------------------------------------------------------------------------------------------------
  register({email, password, displayName} : ISignupCredentials){
    return from(createUserWithEmailAndPassword(this._Auth, email, password)).pipe(
      switchMap(({ user }) => updateProfile(user, { displayName , photoURL:"./assets/images/user_1.png"}))
    );
  }


// -----------------------------------------------------------------------------------------------------------------------
  login({email, password} : ISigninCredentials){
    return from(signInWithEmailAndPassword(this._Auth, email, password)).pipe(
      switchMap(userCredential => {
        // Get the JWT token
        return from(userCredential.user.getIdToken());
      })
    );
  }


// -----------------------------------------------------------------------------------------------------------------------
  signOut(){
    return from(this._Auth.signOut());
  }
}