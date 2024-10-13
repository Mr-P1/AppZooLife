import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from './../common/servicios/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, personOutline, callOutline, carOutline, eyeOutline, eyeOffOutline, lockClosed } from 'ionicons/icons';
import { IonHeader, IonRow, IonContent, IonGrid, IonCol, IonList, IonItem, IonInput, IonButton, IonText, IonLabel ,IonSelectOption, IonSelect, IonIcon} from "@ionic/angular/standalone";
import { IonCard } from '@ionic/angular/standalone';


@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  standalone: true,
  imports: [IonLabel, IonCard ,IonSelect, IonText, IonButton, IonInput, IonItem, IonList, IonCol, IonGrid, IonContent, IonRow, IonHeader,  CommonModule, RouterLink, ReactiveFormsModule,IonSelectOption, IonIcon]
})
export class RegistrarsePage  {

  constructor(
    private alertController: AlertController
  ) {
    addIcons({ mailOutline, keyOutline, personOutline, callOutline, carOutline, eyeOutline, eyeOffOutline, lockClosed });
  }



  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    nombre: this._formBuilder.control('', [Validators.required]),
    telefono: this._formBuilder.control('', [Validators.required]),
    tipo: this._formBuilder.control('', [Validators.required]),
    patente: this._formBuilder.control(''),
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const { email, password, telefono, nombre, tipo, patente } = this.form.value;

      if (!email || !password) return;

      // Intentar registrar al usuario
      await this._authService.registrarse(email, password, String(nombre), String(telefono), String(tipo), String(patente));

      // Restablecer el formulario después del registro exitoso
      this.form.reset();

      // Redirigir al usuario a la página de login después del registro exitoso
      this._router.navigate(['/login']);

    } catch (error: any) {
      // Mostrar la alerta si hay un error
      this.handleError(error);
    }
  }

  // Función para manejar errores específicos de Firebase y mostrar la alerta correspondiente
  handleError(error: any) {
    let message = 'El correo ya esta en uso.';

    // Detectar si el error es que el correo ya está en uso
    if (error.code === 'auth/email-already-in-use') {
      message = 'Este correo electrónico ya está en uso.';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    }

    // Mostrar la alerta con el mensaje de error
    this.showAlert('Error en el registro', message);
  }

  // Función para mostrar la alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }




  submit2(){
    console.log(this.form.value)
  }
}
