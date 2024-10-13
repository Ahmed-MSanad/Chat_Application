import { MatButtonModule } from '@angular/material/button';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';
import { UserService } from '../../core/services/user.service';

export type MenuItem = {
  icon : string,
  label : string,
  route? : string,
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly afAuth = inject(AngularFireAuth);
  private readonly _UserService = inject(UserService);

  currentUser: firebase.User | null = null;  // Use firebase.User from the compat module

  menuItems = signal<MenuItem[]>([
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: 'home',
    },
    {
      icon: 'chat',
      label: 'Chats',
      route: 'messages',
    },
    {
      icon: 'contacts',
      label: 'Users',
      route: 'chatUsersList',
    },
  ]);

  collapsed = signal(true);

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '250px');

  profilePicSize = computed(() => this.collapsed() ? '32px' : '112px');

// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷

  logOut(){
    this._AuthService.signOut().subscribe({
      next:(res) => {
        this._Router.navigate(['/login']);
      }
    });
  }

// 💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛

  ngOnInit(): void {
    // Subscribe to auth state changes to get the current user
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        console.log("User info:", user);
        // You can access user's details like email, displayName, etc.
        console.log("Email:", user.email);
        console.log("UID:", user.uid);
      } else {
        console.log("No user logged in.");
      }
    });
  }

// 💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛

  
  setProfile(){
    Swal.fire({
      title: 'Update your profile',
      html: `
        <input type="text" id="swal-input1" class="swal2-input" placeholder="Enter your new Image URL">
        <input type="text" id="swal-input2" class="swal2-input" placeholder="Enter your new username">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const imageURL = document.getElementById('swal-input1') as HTMLInputElement;
        const username = document.getElementById('swal-input2') as HTMLInputElement;
        return { imageURL, username };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { imageURL, username } = result.value;

        // update in the firebase store =>
        this._UserService.updateUserProfile(this.currentUser?.uid, {
          displayName: username.value ? username.value : this.currentUser?.displayName,
          photoURL: imageURL.value ? imageURL.value : this.currentUser?.photoURL,
        });

        this.currentUser?.updateProfile({
          photoURL: imageURL.value ? imageURL.value : this.currentUser.photoURL,
          displayName: username.value ? username.value : this.currentUser.displayName,
        }).then(() => {
          console.log('Profile photo updated successfully.');
        }).catch((error) => {
          console.error('Error updating profile photo:', error);
        });
      }
    });
  }

// 💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛

// Dark & Light Themes
  is_light_mode : boolean = true;
  modeToggle(){
    this.is_light_mode = !this.is_light_mode;
    document.documentElement.classList.toggle("dark");
  }
}
