import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Reaction, ReactionPlanta } from 'src/app/common/models/reaction.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { AuthService } from './../../common/servicios/auth.service';
import { IonContent, IonList, IonItem, IonSearchbar, IonLabel, IonCard, IonCardHeader, IonButton, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { leafOutline, pawOutline, star, personCircle, chevronUpCircle, document, colorPalette, globe, qrCodeOutline, earthOutline, mapOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Planta } from 'src/app/common/models/plantas.model';
import { NotificacionesService } from 'src/app/common/servicios/notificaciones.service';

@Component({
  selector: 'app-inicio-adulto',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [ZXingScannerModule, IonIcon, IonFabList, IonFabButton, IonFab, IonCardTitle, IonButton, IonCardHeader, IonCard, IonLabel, IonSearchbar, IonItem, IonList, IonContent, CommonModule, RouterLink,]
})
export class InicioPage implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;



// Agrega variables para almacenar las clases y familias únicas
  clasesAnimales: string[] = [];
  familiasPlantas: string[] = [];
  currentClaseIndex: number = 0; // Índice actual de la clase seleccionada
  currentFamiliaIndex: number = 0; // Índice actual de la familia seleccionada
  selectedEspecie: string | null = null; // Especie seleccionada para mostrar en el encabezado
  isFilteredByEspecie: boolean = false; // Controla la visibilidad del encabezado de especie
  isFilteredByArea: boolean = false;    // Controla la visibilidad del encabezado de área
  animales: Animal[] = [];
  plantas: Planta[] = [];
  displayedAnimals: Animal[] = [];
  displayedPlantas: Planta[] = [];
  animalesOriginal: Animal[] = [];
  plantasOriginal: Planta[] = [];
  userId: string = '';
  searchTerm: string = '';
  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isSortedByMap: boolean = false;
  filteredItems: (Animal | Planta)[] = [];
  mostrarPlantas: boolean = false;
  areas: string[] = []; // Lista de áreas únicas
  currentAreaIndex: number = 0; // Índice para rastrear el área actual
  selectedArea: string | null = null; // Área seleccionada para mostrar en el encabezado
  floraAreas: string[] = []; // Lista de áreas únicas para plantas
  currentFloraAreaIndex: number = 0; // Índice para rastrear el área actual de plantas




  constructor(
    private animalsService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {
    addIcons({ mapOutline, leafOutline, pawOutline, qrCodeOutline });
  }

  imagenes = [
    'assets/slides/Slide1.jpg',
    'assets/slides/Slide2.jpg',
    'assets/slides/Slide3.jpg',
    'assets/slides/Slide4.jpg',
  ];

  ngOnInit(): void {
    this.loadAnimals();
    this.loadPlantas();
    this.floraAreas = [...new Set(this.plantas.map(planta => planta.area).filter(area => area !== undefined))];



    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadAnimalsWithReactions();
        this.loadPlantsWithReactions();
      }
    });
  }



  loadAnimals() {
    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      this.animalesOriginal = [...data];
      this.displayedAnimals = [...this.animales];  // Carga todos los animales a la vez

      // Obtener áreas y clases únicas de los animales
      this.areas = [...new Set(this.animales.map(animal => animal.area))];
      this.clasesAnimales = [...new Set(this.animales.map(animal => animal.clase))];
    });
  }

  loadPlantas() {
    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      this.plantasOriginal = [...data];
      this.displayedPlantas = [...this.plantas];  // Carga todas las plantas a la vez

      // Obtener áreas y familias únicas de las plantas
      this.floraAreas = [...new Set(this.plantas.map(planta => planta.area))];
      this.familiasPlantas = [...new Set(this.plantas.map(planta => planta.familia))];
    });
  }



  filterItems(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const filteredAnimales = this.animales.filter(animal =>
        animal.nombre_comun.toLowerCase().includes(this.searchTerm)
      );
      const filteredPlantas = this.plantas.filter(planta =>
        planta.nombre_comun.toLowerCase().includes(this.searchTerm)
      );

      this.filteredItems = [...filteredAnimales, ...filteredPlantas];
    } else {
      this.filteredItems = [];
    }
  }


  // Método para filtrar por especie (clase o familia)
  filterByEspecie() {
    this.isFilteredByEspecie = true;  // Activa el encabezado de especie
    this.isFilteredByArea = false;    // Desactiva el encabezado de área

    if (this.mostrarPlantas) {
      if (this.familiasPlantas.length > 0) {
        this.selectedEspecie = this.familiasPlantas[this.currentFamiliaIndex];
        this.displayedPlantas = this.plantas.filter(planta => planta.familia === this.selectedEspecie);
        this.currentFamiliaIndex = (this.currentFamiliaIndex + 1) % this.familiasPlantas.length;
      }
    } else {
      if (this.clasesAnimales.length > 0) {
        this.selectedEspecie = this.clasesAnimales[this.currentClaseIndex];
        this.displayedAnimals = this.animales.filter(animal => animal.clase === this.selectedEspecie);
        this.currentClaseIndex = (this.currentClaseIndex + 1) % this.clasesAnimales.length;
      }
    }
  }

  // Método para filtrar por área
  filterByArea() {
    this.isFilteredByArea = true;      // Activa el filtro de área
    this.isFilteredByEspecie = false;  // Desactiva el filtro de especie

    if (this.mostrarPlantas) {
      // Filtra por áreas específicas para plantas
      if (this.floraAreas.length > 0) {
        this.selectedArea = this.floraAreas[this.currentFloraAreaIndex];
        this.displayedPlantas = this.plantas.filter(planta => planta.area === this.selectedArea);

        // Avanza al siguiente área de plantas, y reinicia el índice si llega al final
        this.currentFloraAreaIndex = (this.currentFloraAreaIndex + 1) % this.floraAreas.length;
      } else {
        console.warn('No hay áreas disponibles para flora.');
      }
    } else {
      // Filtra por áreas específicas para animales
      if (this.areas.length > 0) {
        this.selectedArea = this.areas[this.currentAreaIndex];
        this.displayedAnimals = this.animales.filter(animal => animal.area === this.selectedArea);

        // Avanza al siguiente área de animales, y reinicia el índice si llega al final
        this.currentAreaIndex = (this.currentAreaIndex + 1) % this.areas.length;
      } else {
        console.warn('No hay áreas disponibles para fauna.');
      }
    }
  }


  goToItem(item: Animal | Planta) {
    const route = 'familia' in item ? '/adulto/planta-info' : '/adulto/animal-info';
    this.router.navigate([route, item.id]);
    this.router.navigate([route, item.id], { queryParams: { metodo: 'searchbar' } });
    this.searchTerm = '';
    this.filteredItems = [];
  }
  // Método para alternar entre fauna y flora
  toggleMostrarPlantas() {
    this.mostrarPlantas = !this.mostrarPlantas;
    this.selectedEspecie = null;
    this.selectedArea = null;
    this.isFilteredByEspecie = false;
    this.isFilteredByArea = false;

    if (this.mostrarPlantas) {
      this.displayedPlantas = this.plantas;  // Carga todas las plantas al cambiar a plantas
    } else {
      this.displayedAnimals = this.animales;  // Carga todos los animales al cambiar a animales
    }
  }


  toggleOrdenRuta() {
    if (this.isSortedByMap) {
      // Restauramos el orden original sin paginación
      this.displayedAnimals = [...this.animalesOriginal];
      this.displayedPlantas = [...this.plantasOriginal];
    } else {
      // Ordenamos por `posicion_mapa` sin aplicar slice
      this.displayedAnimals = [...this.animalesOriginal].sort((a, b) => a.posicion_mapa - b.posicion_mapa);
      this.displayedPlantas = [...this.plantasOriginal].sort((a, b) => a.posicion_mapa - b.posicion_mapa);
    }

    this.isSortedByMap = !this.isSortedByMap;
  }



  toggleQrScan() {
    this.isScanning = !this.isScanning;
    if (!this.isScanning && this.scanner) {
      this.scanner.reset();
    }
  }

  onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);
    this.isScanning = false;

    if (result) {
      if (this.scanner) {
        this.scanner.reset();
      }
      this.animalsService.getAnimalById(result).subscribe((animal) => {
        if (animal) {
          this.router.navigate(['/adulto/animal-info', result], { queryParams: { metodo: 'qr' } });
        } else {
          this.animalsService.getPlantaById(result).subscribe((planta) => {
            if (planta) {
              this.router.navigate(['/adulto/planta-info', result], { queryParams: { metodo: 'qr' } });
            } else {
              console.error('No se encontró información para el ID escaneado.');
            }
          });
        }
      });
    } else {
      if (this.scanner) {
        this.scanner.reset();
      }
    }
  }

  loadAnimalsWithReactions() {
    this.animalsService.getAnimales().subscribe((animales: Animal[]) => {
      this.animales = animales;
      this.animalesOriginal = [...animales];
      this.animales.forEach(animal => {
        this.animalsService.getUserReaction(animal.id, this.userId).subscribe(reaction => {
          animal.reaccion = reaction ? reaction.reaction : null;
        });
      });
    });
  }

  loadPlantsWithReactions() {
    this.animalsService.getPlantas().subscribe((plantas: Planta[]) => {
      this.plantas = plantas;
      this.plantasOriginal = [...plantas];
      this.plantas.forEach(planta => {
        this.animalsService.getUserReactionPlanta(planta.id, this.userId).subscribe(reaction => {
          planta.reaccion = reaction ? reaction.reaction : null;
        });
      });
    });
  }

  like(animalId: string) {
    const animal = this.animales.find(a => a.id === animalId);
    if (animal) {
      animal.reaccion = true;
      const tipo = localStorage.getItem('tipo') || 'desconocido';

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
            tipo
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
      const tipo = localStorage.getItem('tipo') || 'desconocido';

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
            tipo
          };
          this.animalsService.addReaction(reaction).subscribe(() => {
            console.log('Reacción guardada como No me gusta');
          });
        }
      });
    }
  }

  likePlanta(plantaId: string) {
    const planta = this.plantas.find(p => p.id === plantaId);
    if (planta) {
      planta.reaccion = true;
      const tipo = localStorage.getItem('tipo') || 'desconocido';

      this.animalsService.getUserReactionPlanta(plantaId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          this.animalsService.updateReactionPlanta(existingReaction.id, { reaction: true, tipo }).subscribe(() => {
            console.log('Reacción actualizada a Like');
          });
        } else {
          const reaction: ReactionPlanta = {
            plantaId,
            userId: this.userId,
            reaction: true,
            fecha: new Date(),
            tipo
          };
          this.animalsService.addReactionPlanta(reaction).subscribe(() => {
            console.log('Reacción guardada como Like');
          });
        }
      });
    }
  }

  dontLikePlanta(plantaId: string) {
    const planta = this.plantas.find(p => p.id === plantaId);
    if (planta) {
      planta.reaccion = false;
      const tipo = localStorage.getItem('tipo') || 'desconocido';

      this.animalsService.getUserReactionPlanta(plantaId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          this.animalsService.updateReactionPlanta(existingReaction.id, { reaction: false, tipo }).subscribe(() => {
            console.log('Reacción actualizada a No me gusta');
          });
        } else {
          const reaction: ReactionPlanta = {
            plantaId,
            userId: this.userId,
            reaction: false,
            fecha: new Date(),
            tipo
          };
          this.animalsService.addReactionPlanta(reaction).subscribe(() => {
            console.log('Reacción guardada como No me gusta');
          });
        }
      });
    }
  }
}
