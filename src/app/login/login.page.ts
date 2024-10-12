import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,IonCol, IonHeader,IonGrid, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule,FormBuilder, FormControl,Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterLink,Router } from '@angular/router';
import {AuthService} from './../common/servicios/auth.service'

import { addIcons } from 'ionicons';
import { mailOutline,keyOutline } from 'ionicons/icons';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton,IonCol,IonGrid, IonInput, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,RouterModule,ReactiveFormsModule]
})
export class LoginPage  {

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
      // Verificar si la boleta existe
      const boletaData = await this._authService.getBoleta(boleta);
      if (!boletaData) {
        alert('Boleta no encontrada.');
        return;
      }

      // Autenticarse con el email y password
      await this._authService.logearse({ email, password });

      // Obtener el ID del usuario actual
      const userId = this._authService.currentUserId;
      if (!userId) {
        alert('Error obteniendo los datos del usuario.');
        return;
      }

      // Mover la boleta a Boletas_usadas y eliminarla de Boletas
      await this._authService.usarBoleta(boleta, userId);

      // Navegar a la página principal
      this._router.navigate(['/home']);
    } catch (error) {
      console.error('Error durante el proceso de login:', error);
      alert('Hubo un problema con el login. Por favor, inténtalo de nuevo.');
    }
  }

}
