import { Component, OnInit,ViewChild} from '@angular/core';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Reaction } from 'src/app/common/models/reaction.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { AuthService } from './../../common/servicios/auth.service';
import { IonContent, IonList, IonItem, IonSearchbar, IonLabel, IonCard, IonCardHeader, IonButton, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { leafOutline,pawOutline,star,personCircle, chevronUpCircle, document, colorPalette, globe,qrCodeOutline,earthOutline,mapOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Planta } from 'src/app/common/models/plantas.model';
import { NotificacionesService } from 'src/app/common/servicios/notificaciones.service';



@Component({
  selector: 'app-inicio-adulto',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [ZXingScannerModule,IonIcon, IonFabList, IonFabButton, IonFab, IonCardTitle, IonButton, IonCardHeader, IonCard, IonLabel, IonSearchbar, IonItem, IonList, IonContent, CommonModule, RouterLink,]
})
export class InicioPage implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;

  animales: Animal[] = [];
  plantas: Planta[] = [];
  animalesOriginal: Animal[] = []; // Guardar el orden original
  userId: string = '';
  searchTerm: string = ''; // Para almacenar el término de búsqueda
  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isSortedByMap: boolean = false; // Controla si está ordenado por posición
  filteredAnimals: Animal[] = []; // Lista de animales filtrados
  mostrarPlantas: boolean = false;


  constructor(
    private animalsService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {
    addIcons({ leafOutline,earthOutline, mapOutline, chevronUpCircle, document, colorPalette, globe, star, personCircle, qrCodeOutline, pawOutline});
  }

  imagenes = [
    'assets/slides/Slide1.jpg',
    'assets/slides/Slide2.jpg',
    'assets/slides/Slide3.jpg',
    'assets/slides/Slide4.jpg',
  ];

  ngOnInit(): void {
    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      this.animalesOriginal = [...data]; // Guarda el orden original
    });

    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;

    });

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadAnimalsWithReactions();

        // Verificar cuántos animales ha visto el usuario
        this.animalsService.getAnimalesVistosPorUsuario(this.userId).subscribe((animalesVistos) => {
          const animalesVistosCount = animalesVistos.length;

          // Verificar si ya se ha mostrado la notificación anteriormente
          const notificacionMostrada = localStorage.getItem('notificacionMostrada');

          if (animalesVistosCount == 5 && !notificacionMostrada) {
            this.notificacionesService.mostrarNotificacion(
              '¡Felicidades!',
              'Has visto 5 animales. Ahora puedes participar en la trivia.'
            );

            // Guardar en localStorage que la notificación ya fue mostrada
            localStorage.setItem('notificacionMostrada', 'true');
          }
        });
      }
    });
  }

  loadAnimalsWithReactions() {
    this.animalsService.getAnimales().subscribe((animales: Animal[]) => {
      this.animales = animales;
      this.animalesOriginal = [...animales]; // Guarda el orden original

      this.animales.forEach(animal => {
        this.animalsService.getUserReaction(animal.id, this.userId).subscribe(reaction => {
          animal.reaccion = reaction ? reaction.reaction : null;
        });
      });
    });
  }

  // Alterna entre ordenar por posición y restaurar el orden original
  toggleOrdenRuta() {
    if (this.isSortedByMap) {
      // Restaurar el orden original
      this.animales = [...this.animalesOriginal];
    } else {
      // Ordenar por 'posicion_mapa'
      this.animales.sort((a, b) => a.posicion_mapa - b.posicion_mapa);
    }
    this.isSortedByMap = !this.isSortedByMap; // Cambiar el estado
  }

  toggleQrScan() {
    this.isScanning = !this.isScanning;
    if (!this.isScanning && this.scanner) {
      this.scanner.reset();
    }
  }

  like(animalId: string) {
    const animal = this.animales.find(a => a.id === animalId);
    if (animal) {
      animal.reaccion = true;
      const tipo = localStorage.getItem('tipo') || 'desconocido'; // Obtenemos el tipo de usuario

      this.animalsService.getUserReaction(animalId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          this.animalsService.updateReaction(existingReaction.id, { reaction: true, tipo }).subscribe(() => {
            console.log('Reacción actualizada a Like');
          });
        } else {
          const reaction: Reaction = {
            animalId,
            userId: this.userId,
            reaction: true,
            fecha: new Date(),
            tipo // Incluimos el tipo de usuario en la nueva reacción
          };
          this.animalsService.addReaction(reaction).subscribe(() => {
            console.log('Reacción guardada como Like');
          });
        }
      });
    }
  }

  dontLike(animalId: string) {
    const animal = this.animales.find(a => a.id === animalId);
    if (animal) {
      animal.reaccion = false;
      const tipo = localStorage.getItem('tipo') || 'desconocido'; // Obtenemos el tipo de usuario

      this.animalsService.getUserReaction(animalId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          this.animalsService.updateReaction(existingReaction.id, { reaction: false, tipo }).subscribe(() => {
            console.log('Reacción actualizada a No me gusta');
          });
        } else {
          const reaction: Reaction = {
            animalId,
            userId: this.userId,
            reaction: false,
            fecha: new Date(),
            tipo // Incluimos el tipo de usuario en la nueva reacción
          };
          this.animalsService.addReaction(reaction).subscribe(() => {
            console.log('Reacción guardada como No me gusta');
          });
        }
      });
    }
  }

    onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);
    this.isScanning = false;

    const animalId = this.extractAnimalId(result);
    if (animalId) {
      console.log('Redirigiendo a la página del animal:', animalId);

      // Detén el escáner al redirigir
      if (this.scanner) {
        this.scanner.reset();
      }

      this.router.navigate(['/animal-info', animalId]);
    } else {
      console.log('No se encontró un ID de animal válido en el QR.');

      // Detén el escáner si no se encuentra un ID válido
      if (this.scanner) {
        this.scanner.reset();
      }
    }
  }

    extractAnimalId(result: string): string | null {
    console.log('Procesando URL:', result);
    const regex = /animal-info\/(\w+)/;
    const match = result.match(regex);
    return match ? match[1] : null;
  }


    // Método para filtrar animales según el término de búsqueda
  filterAnimals(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.filteredAnimals = this.animales.filter(animal =>
        animal.nombre_comun.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredAnimals = [];
    }
  }

  // Método para redirigir a la página de información del animal
  goToAnimal(animalId: string) {
    this.router.navigate(['/animal-info', animalId]);
    this.searchTerm = '';
    this.filteredAnimals = [];
  }

  toggleMostrarPlantas() {
    this.mostrarPlantas = !this.mostrarPlantas;
  }



}
