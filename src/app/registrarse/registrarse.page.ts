import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from './../common/servicios/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, personOutline, callOutline, carOutline, eyeOutline, eyeOffOutline, lockClosed } from 'ionicons/icons';
import { IonHeader, IonRow, IonContent, IonGrid, IonCol, IonList, IonItem, IonInput, IonButton, IonText, IonLabel ,IonSelectOption, IonSelect, IonIcon, IonNote, IonDatetime } from "@ionic/angular/standalone";
import { IonCard } from '@ionic/angular/standalone';


@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonNote, IonLabel, IonCard ,IonSelect, IonText, IonButton, IonInput, IonItem, IonList, IonCol, IonGrid, IonContent, IonRow, IonHeader,  CommonModule, RouterLink, ReactiveFormsModule,IonSelectOption, IonIcon]
})
export class RegistrarsePage implements OnInit {

  constructor(
    private alertController: AlertController
  ) {
    addIcons({ mailOutline, keyOutline, personOutline, callOutline, carOutline, eyeOutline, eyeOffOutline, lockClosed });
  }



  actualizarComunas(regionSeleccionada: string) {
    const region = this.regiones.find((r) => r.nombre === regionSeleccionada);
    this.comunasFiltradas = region ? region.comunas : [];
    this.form.get('comuna')?.setValue(''); // Limpiar la comuna seleccionada
  }



  regiones = [
    {
      nombre: 'Arica y Parinacota (XV)',
      comunas: ['Arica', 'Camarones', 'General Lagos', 'Putre'],
    },
    {
      nombre: 'Tarapacá (I)',
      comunas: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte'],
    },
    {
      nombre: 'Antofagasta (II)',
      comunas: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla'],
    },
    {
      nombre: 'Atacama (III)',
      comunas: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar'],
    },
    {
      nombre: 'Coquimbo (IV)',
      comunas: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paihuano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña'],
    },
    {
      nombre: 'Valparaíso (V)',
      comunas: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar'],
    },
    {
      nombre: 'Metropolitana (RM)',
      comunas: ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura'],
    },
    {
      nombre: 'O\'Higgins (VI)',
      comunas: ['Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchigüe', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'Santa Cruz'],
    },
    {
      nombre: 'Maule (VII)',
      comunas: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas'],
    },
    {
      nombre: 'Ñuble (XVI)',
      comunas: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
    },
    {
      nombre: 'Biobío (VIII)',
      comunas: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel'],
    },
    {
      nombre: 'La Araucanía (IX)',
      comunas: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica'],
    },
    {
      nombre: 'Los Ríos (XIV)',
      comunas: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia'],
    },
    {
      nombre: 'Los Lagos (X)',
      comunas: ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo'],
    },
    {
      nombre: 'Aysén (XI)',
      comunas: ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', 'O’Higgins', 'Río Ibáñez', 'Tortel'],
    },
    // Continúa añadiendo más regiones según sea necesario
  ];



  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    nombre: this._formBuilder.control('', [Validators.required]),
    telefono: this._formBuilder.control('', [Validators.required]),
    fechaNacimiento:this._formBuilder.control('',[Validators.required]),
    genero: this._formBuilder.control('', [Validators.required]),
    patente: this._formBuilder.control(''),
    region: this._formBuilder.control('', [Validators.required]),
    comuna: this._formBuilder.control('', [Validators.required])

  });

  comunasFiltradas: string[] = [];

  ngOnInit() {
    this.form.get('region')?.valueChanges.subscribe((regionSeleccionada) => {
      if (regionSeleccionada) {
        this.actualizarComunas(regionSeleccionada);
      } else {
        this.comunasFiltradas = []; // Si no hay región seleccionada, limpiamos las comunas
      }
    });
  }


  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const { email, password, telefono, nombre, genero, patente, region ,comuna } = this.form.value;
      const fechaNacimientoString = this.form.get('fechaNacimiento')?.value; // Obtén el valor de fecha como string
      const fechaNacimiento = fechaNacimientoString ? new Date(fechaNacimientoString) : null;
      const fechaRegistro = new Date();

      if (!email || !password) return;

      // Intentar registrar al usuario
      await this._authService.registrarse(email, password, String(nombre), String(telefono), String(genero), String(patente) ,fechaNacimiento!, String(region),String(comuna), fechaRegistro);

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

  validatePhone(event: any) {
    // Obtén el valor del campo de teléfono
    const value = event.target.value;

    // Elimina cualquier carácter que no sea un número o un '+'
    const filteredValue = value.replace(/[^0-9+]/g, '');

    // Asigna el valor filtrado al campo de teléfono
    event.target.value = filteredValue;

    // Actualiza el valor del formulario
    this.form.get('telefono')?.setValue(filteredValue);
  }




  submit2(){
    console.log(this.form.value)
  }
}
