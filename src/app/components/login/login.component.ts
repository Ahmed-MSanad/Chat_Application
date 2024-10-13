import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthNavComponent } from '../auth-nav/auth-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, AuthNavComponent, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy{
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly _FormBuilder = inject(FormBuilder);
  loginUnsubscribe ! : Subscription;
  loginForm : FormGroup = this._FormBuilder.group({
    email : [null, [Validators.required, Validators.email]],
    password : [null, [Validators.required, Validators.pattern(/^(?=(.*\w){5,})(?=.*\W).{6,}$/)]]
  });


  login():void{
    this.loginUnsubscribe = this._AuthService.login(this.loginForm.value).subscribe({
      next:(res)=>{
        this._Router.navigate(['/home']);
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }


  ngOnDestroy(): void {
    this.loginUnsubscribe?.unsubscribe();
  }
}
