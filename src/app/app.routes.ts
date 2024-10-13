import { Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard' ;

export const routes: Routes = [
    {path:"", loadComponent : () => import('./layouts/auth-layout/auth-layout.component').then((c) => c.AuthLayoutComponent), ...canActivate(() => redirectLoggedInTo(['home'])), children:[ // this Guard won't let the user to the login page from within the home page until log out // auth Guard pipe that contains the logic => how and where the user should be redirected
        {path:'', redirectTo:'register', pathMatch:'full'},
        {path:'register', loadComponent: () => import('./components/register/register.component').then((c) => c.RegisterComponent)},
        {path:'login', loadComponent : () => import('./components/login/login.component').then((c) => c.LoginComponent)},
    ]},
    {path:"", loadComponent: () => import('./layouts/blank-layout/blank-layout.component').then((c) => c.BlankLayoutComponent), ...canActivate(() => redirectUnauthorizedTo(['login'])), children:[
        {path:'', redirectTo:'home', pathMatch:'full'},
        {path:'home', loadComponent: () => import('./components/home/home.component').then((c) => c.HomeComponent)},
        {path:'messages', loadComponent: () => import('./components/messages/messages.component').then((c) => c.MessagesComponent)},
        {path:'chatUsersList', loadComponent: () => import('./components/chat-list/chat-list.component').then((c) => c.ChatListComponent)},
    ]},
];
