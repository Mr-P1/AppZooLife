import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA ,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCol, IonHeader, IonGrid, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone'; // Importa IonIcon
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../common/servicios/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, eyeOutline, eyeOffOutline, lockClosed, qrCodeOutline } from 'ionicons/icons';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ZXingScannerModule,IonButton, IonIcon, IonCard, IonCol, IonGrid, IonInput, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule, ReactiveFormsModule, IonIcon], // Asegúrate de incluir IonIcon aquí
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añade el esquema para permitir el uso de ion-icon
})
export class LoginPage {

  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;
  userId:string = '';
  isScanning: boolean = false; // Variable para manejar el estado del escáner
  allowedFormats = [BarcodeFormat.QR_CODE]; // Definir los formatos permitidos
  boleta:string = "";

  constructor(){
    addIcons({mailOutline,keyOutline,qrCodeOutline,eyeOutline,eyeOffOutline,lockClosed});
  }

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(5)]),

  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    if (!email || !password || !this.boleta) return;

    try {
      const boletaData = await this._authService.getBoleta(this.boleta);
      if (!boletaData) {
        alert('Boleta no encontrada.');
        return;
      }

      await this._authService.logearse2({ email, password });

      const userId = this._authService.currentUserId;
      if (!userId) {
        alert('Error obteniendo los datos del usuario.');
        return;
      }

      await this._authService.usarBoleta(this.boleta, userId);

      this._router.navigate(['/home']);
    } catch (error) {
      console.error('Error durante el proceso de login:', error);
      alert('Hubo un problema con el login. Por favor, inténtalo de nuevo.');
    }
  }


  toggleQrScan() {
    this.isScanning = !this.isScanning;

    if (!this.isScanning && this.scanner) {
      // Resetea la cámara si se detiene el escaneo
      this.scanner.reset();
    }
  }

  onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);

    // Asignar el resultado escaneado al control 'boleta'
    this.boleta = result;

    // Apagar el escáner
    this.isScanning = false;

    if (this.scanner) {
      this.scanner.reset();
    }

    // Verifica que los otros campos también estén completos antes de iniciar sesión
    if (this.form.valid && this.boleta) {
      // Llamar automáticamente al submit() para iniciar sesión
      this.submit();
    } else {
      alert('Por favor, completa el correo y la contraseña antes de escanear.');
    }
  }


}
