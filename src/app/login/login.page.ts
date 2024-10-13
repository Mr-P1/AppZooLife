import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCol, IonHeader, IonGrid, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone'; // Importa IonIcon
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../common/servicios/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, eyeOutline, eyeOffOutline, lockClosed } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonCard, IonCol, IonGrid, IonInput, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule, ReactiveFormsModule, IonIcon], // Asegúrate de incluir IonIcon aquí
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añade el esquema para permitir el uso de ion-icon
})
export class LoginPage {

  constructor(){
    addIcons({
      mailOutline,
      keyOutline,
      eyeOutline,
      eyeOffOutline,
      lockClosed
    });
  }

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    boleta: this._formBuilder.control('', [Validators.required]),
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, boleta } = this.form.value;

    if (!email || !password || !boleta) return;

    try {
      const boletaData = await this._authService.getBoleta(boleta);
      if (!boletaData) {
        alert('Boleta no encontrada.');
        return;
      }

      await this._authService.logearse({ email, password });

      const userId = this._authService.currentUserId;
      if (!userId) {
        alert('Error obteniendo los datos del usuario.');
        return;
      }

      await this._authService.usarBoleta(boleta, userId);
      this._router.navigate(['/home']);
    } catch (error) {
      console.error('Error durante el proceso de login:', error);
      alert('Hubo un problema con el login. Por favor, inténtalo de nuevo.');
    }
  }

}