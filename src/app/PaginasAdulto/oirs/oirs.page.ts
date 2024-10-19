import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/common/servicios/auth.service'; // Importa tu servicio de autenticación

@Component({
  selector: 'app-oirs-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule
  ],
  templateUrl: './oirs.page.html',
  styleUrls: ['./oirs.page.scss'],
})
export class OirsFormPage {
  oirsForm: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null; // Variable para almacenar el ID del usuario

  regiones = [
    {
      nombre: 'Región de Arica y Parinacota (XV)',
      comunas: ['Arica', 'Camarones', 'General Lagos', 'Putre'],
    },
    {
      nombre: 'Región de Tarapacá (I)',
      comunas: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte'],
    },
    {
      nombre: 'Región de Antofagasta (II)',
      comunas: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla'],
    },
    {
      nombre: 'Región de Atacama (III)',
      comunas: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar'],
    },
    {
      nombre: 'Región de Coquimbo (IV)',
      comunas: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paihuano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña'],
    },
    {
      nombre: 'Región de Valparaíso (V)',
      comunas: ['Algarrobo', 'Cabildo', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Calera', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar'],
    },
    {
      nombre: 'Región Metropolitana de Santiago (RM)',
      comunas: ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura'],
    },
    {
      nombre: 'Región de O\'Higgins (VI)',
      comunas: ['Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchigüe', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'Santa Cruz'],
    },
    {
      nombre: 'Región del Maule (VII)',
      comunas: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas'],
    },
    {
      nombre: 'Región de Ñuble (XVI)',
      comunas: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
    },
    {
      nombre: 'Región del Biobío (VIII)',
      comunas: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel'],
    },
    {
      nombre: 'Región de La Araucanía (IX)',
      comunas: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica'],
    },
    {
      nombre: 'Región de Los Ríos (XIV)',
      comunas: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia'],
    },
    {
      nombre: 'Región de Los Lagos (X)',
      comunas: ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo'],
    },
    {
      nombre: 'Región de Aysén del General Carlos Ibáñez del Campo (XI)',
      comunas: ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', 'O’Higgins', 'Río Ibáñez', 'Tortel'],
    },
    {
      nombre: 'Región de Magallanes y de la Antártica Chilena (XII)',
      comunas: ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine'],
    },
  ];

  comunasFiltradas: string[] = [];

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.oirsForm = this.formBuilder.group({
      tipoSolicitud: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      region: ['', Validators.required],
      comuna: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      esAfectado: [false],
      detalles: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Capturar el ID del usuario autenticado
    this.authService.authState$.subscribe((user) => {
      if (user) {
        this.userId = user.uid; // Asigna el ID del usuario
      }
    });

    // Escuchar cambios en la selección de la región
    this.oirsForm.get('region')?.valueChanges.subscribe((regionSeleccionada) => {
      this.actualizarComunas(regionSeleccionada);
    });
  }

  actualizarComunas(regionSeleccionada: string) {
    const region = this.regiones.find((r) => r.nombre === regionSeleccionada);
    this.comunasFiltradas = region ? region.comunas : [];
    this.oirsForm.get('comuna')?.setValue(''); // Limpiar la comuna seleccionada
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
      formData.userId = this.userId; // Agregar el ID del usuario al formulario
      formData.fechaEnvio = new Date().toISOString(); // Agregar la fecha y hora actual

      console.log('Formulario enviado:', formData);
      // Aquí puedes agregar la lógica para enviar el formulario a tu backend o base de datos.
    } else {
      console.log('Formulario no válido');
    }
  }
}
