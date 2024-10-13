import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthNavComponent } from '../../components/auth-nav/auth-nav.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule, AuthNavComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

}
