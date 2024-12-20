import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/common/servicios/auth.service'; // Importa tu servicio de autenticación
import { OirsService, CrearOirs } from '../../common/servicios/oirs.service';
import { Usuario } from 'src/app/common/models/usuario.model';

@Component({
  selector: 'app-oirs-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule
  ],
  templateUrl: './oirs.page.html',
  styleUrls: ['./oirs.page.scss'],
})
export class OirsFormPage implements OnInit {
  oirsForm: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;
  usuario: Usuario | null = null;  // Variable para almacenar los datos del usuario
  correo: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private _oirsService: OirsService,
    private _router: Router
  ) {
    // Configurar el formulario sin los campos de región y comuna
    this.oirsForm = this.formBuilder.group({
      tipoSolicitud: ['', Validators.required],
      esAfectado: [false, Validators.required],
      detalles: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Capturar el ID del usuario autenticado
    this.authService.authState$.subscribe((user) => {
      if (user) {

        this.userId = user.uid; // Asigna el ID del usuario
        this.correo = user.correo

      }
    });
  }

  ngOnInit() {

    this.loadUserData();
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async submitForm() {
    if (this.oirsForm.valid) {
      const formData = this.oirsForm.value;
      formData.userId = this.userId; // Agregar el ID del usuario al formulario
      formData.fechaEnvio = new Date(); // Agregar la fecha y hora actual

      // Verificar si el tipo de solicitud es "felicitación" o "sugerencia"
      const isAutoRespondido = formData.tipoSolicitud === 'felicitacion' || formData.tipoSolicitud === 'sugerencia';

      // Crear el objeto 'oirs' con los valores del formulario
      const oirs: CrearOirs = {
        tipoSolicitud: formData.tipoSolicitud,
        esAfectado: formData.esAfectado,
        detalles: formData.detalles,
        userId: this.userId!,
        fechaEnvio: formData.fechaEnvio,
        respondido: isAutoRespondido // Asignar true si aplica, de lo contrario false
      };

      try {
        // Si hay un archivo seleccionado, subirlo y agregar la URL al objeto 'oirs'
        if (this.selectedFile) {
          const imageUrl = await this._oirsService.uploadImage(this.selectedFile);
          oirs.archivoEvidencia = imageUrl;
        }

        // Llamar al servicio para crear el OIRS
        await this._oirsService.createOirs(oirs);

        // Llamar a la función de Firebase para enviar el correo
        this._oirsService.sendOIRSEmail(oirs.tipoSolicitud, this.correo).subscribe({
          next: () => console.log("Correo enviado correctamente"),
          error: (err) => console.error("Error al enviar el correo:", err)
        });

        console.log('OIRS enviado:', oirs);

        // Redirigir a la página de inicio después de enviar el formulario
        this._router.navigate(['/adulto/inicio']);
      } catch (error) {
        console.error('Ha ocurrido un problema, revisa los datos ingresados:', error);
        alert('Ha ocurrido un problema, revisa los datos ingresados');
      }
    } else {
      console.log('Formulario no válido');
      this.oirsForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
    }
  }


  async loadUserData() {
    try {
      // Obtener el UID del usuario actual
      this.userId = this.authService.currentUserId;


      if (this.userId) {
        this.usuario = await this.authService.getUsuarioFirestore(this.userId);

        this.correo = this.usuario?.correo!;

      } else {
        console.error('No se encontró el UID del usuario');
      }

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }




}
