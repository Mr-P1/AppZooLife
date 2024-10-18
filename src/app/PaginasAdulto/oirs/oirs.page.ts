import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-oirs-form',
  templateUrl: './oirs.page.html',
  styleUrls: ['./oirs.page.scss'],
})
export class OirsFormPage {
  oirsForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.oirsForm = this.formBuilder.group({
      tipoSolicitud: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      esAfectado: [false],
      detalles: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }

  submitForm() {
    if (this.oirsForm.valid) {
      const formData = this.oirsForm.value;
      formData.archivoEvidencia = this.selectedFile;
      console.log('Formulario enviado:', formData);
      // Aquí puedes agregar la lógica para enviar el formulario a tu backend o base de datos.
    } else {
      console.log('Formulario no válido');
    }
  }
}

