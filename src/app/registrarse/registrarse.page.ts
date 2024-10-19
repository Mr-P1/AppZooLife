import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from './../common/servicios/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, keyOutline, personOutline, callOutline, carOutline, eyeOutline, eyeOffOutline, lockClosed } from 'ionicons/icons';
import { IonHeader, IonRow, IonContent, IonGrid, IonCol, IonList, IonItem, IonInput, IonButton, IonText, IonLabel, IonSelectOption, IonSelect, IonIcon, IonNote } from "@ionic/angular/standalone";
import { IonCard } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  standalone: true,
  imports: [IonNote, IonLabel, IonCard, IonSelect, IonText, IonButton, IonInput, IonItem, IonList, IonCol, IonGrid, IonContent, IonRow, IonHeader, CommonModule, RouterLink, ReactiveFormsModule, IonSelectOption, IonIcon]
})
export class RegistrarsePage {
  regiones = [
    {
      nombre: 'Región de Arica y Parinacota',
      comunas: ['Arica', 'Camarones', 'General Lagos', 'Putre']
    },
    {
      nombre: 'Región de Tarapacá',
      comunas: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte']
    },
    {
      nombre: 'Región de Antofagasta',
      comunas: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla']
    },
    {
      nombre: 'Región de Atacama',
      comunas: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar']
    },
    {
      nombre: 'Región de Coquimbo',
      comunas: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paihuano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña']
    },
    {
      nombre: 'Región de Valparaíso',
      comunas: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar']
    },
    {
      nombre: 'Región Metropolitana de Santiago',
      comunas: ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura']
    },
    {
      nombre: 'Región de O\'Higgins',
      comunas: ['Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchigüe', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'Santa Cruz']
    },
    {
      nombre: 'Región del Maule',
      comunas: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas']
    },
    {
      nombre: 'Región de Ñuble',
      comunas: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay']
    },
    {
      nombre: 'Región del Biobío',
      comunas: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel']
    },
    {
      nombre: 'Región de La Araucanía',
      comunas: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica']
    },
    {
      nombre: 'Región de Los Ríos',
      comunas: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia']
    },
    {
      nombre: 'Región de Los Lagos',
      comunas: ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo']
    },
    {
      nombre: 'Región de Aysén',
      comunas: ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', 'O’Higgins', 'Río Ibáñez', 'Tortel']
    },
    {
      nombre: 'Región de Magallanes y la Antártica Chilena',
      comunas: ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine']
    }
  ];


  comunasFiltradas: string[] = [];

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
    genero: this._formBuilder.control('', [Validators.required]),
    patente: this._formBuilder.control(''),
    region: this._formBuilder.control('', [Validators.required]),
    comuna: this._formBuilder.control('', [Validators.required])
  });

  ngOnInit() {
    this.form.get('region')?.valueChanges.subscribe((regionSeleccionada) => {
      if (regionSeleccionada) {
        this.actualizarComunas(regionSeleccionada);
      } else {
        this.comunasFiltradas = []; // Si no hay región seleccionada, limpiamos las comunas
      }
    });
  }

  actualizarComunas(regionSeleccionada: string) {
    const region = this.regiones.find((r) => r.nombre === regionSeleccionada);
    this.comunasFiltradas = region ? region.comunas : [];
    this.form.get('comuna')?.setValue(''); // Limpiar la comuna seleccionada
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const { email, password, telefono, nombre, genero, patente } = this.form.value;

      if (!email || !password) return;

      // Modificamos el servicio para solo enviar los 6 parámetros
      await this._authService.registrarse(email, password, String(nombre), String(telefono), String(genero), String(patente));

      this.form.reset();
      this._router.navigate(['/login']);

    } catch (error: any) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    let message = 'El correo ya está en uso.';

    if (error.code === 'auth/email-already-in-use') {
      message = 'Este correo electrónico ya está en uso.';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    }

    this.showAlert('Error en el registro', message);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
