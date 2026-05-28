import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginComponent {
  hidePassword = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const { password } = this.loginForm.getRawValue();

    this.authService.login(password).subscribe({
      next: (success) => {
        this.isSubmitting.set(false);

        if (!success) {
          this.errorMessage.set('La contraseña es incorrecta. Intenta nuevamente.');
          return;
        }

        this.router.navigate(['/admin']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          'No se pudo iniciar sesión. Verifica el backend e inténtalo otra vez.',
        );
      },
    });
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
