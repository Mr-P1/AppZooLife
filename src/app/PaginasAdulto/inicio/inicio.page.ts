import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Reaction, ReactionPlanta } from 'src/app/common/models/reaction.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { AuthService } from './../../common/servicios/auth.service';
import { IonContent, IonList, IonItem, IonSearchbar, IonLabel, IonCard, IonCardHeader, IonButton, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon, IonInfiniteScroll } from "@ionic/angular/standalone";
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
export class InicioPage implements OnInit, AfterViewInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  animales: Animal[] = [];
  plantas: Planta[] = [];
  displayedAnimals: Animal[] = [];
  displayedPlantas: Planta[] = [];
  itemsPerPage: number = 5;
  currentPageAnimals: number = 1;
  currentPagePlantas: number = 1;
  animalesOriginal: Animal[] = [];
  plantasOriginal: Planta[] = [];
  userId: string = '';
  searchTerm: string = '';
  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isSortedByMap: boolean = false;
  filteredItems: (Animal | Planta)[] = [];
  mostrarPlantas: boolean = false;

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

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadAnimalsWithReactions();
        this.loadPlantsWithReactions();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = false;  // Configuración inicial
      }
    }, 0); // Retraso mínimo para permitir la inicialización completa
  }

  loadAnimals() {
    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      this.animalesOriginal = [...data];
      this.displayedAnimals = this.animales.slice(0, this.itemsPerPage);
    });
  }

  loadPlantas() {
    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      this.plantasOriginal = [...data];
      this.displayedPlantas = this.plantas.slice(0, this.itemsPerPage);
    });
  }

  loadMore(event: any) {
    setTimeout(() => {
      if (!this.mostrarPlantas) {
        const start = this.currentPageAnimals * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.displayedAnimals = [
          ...this.displayedAnimals,
          ...this.animales.slice(start, end),
        ];
        this.currentPageAnimals++;
      } else {
        const start = this.currentPagePlantas * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.displayedPlantas = [
          ...this.displayedPlantas,
          ...this.plantas.slice(start, end),
        ];
        this.currentPagePlantas++;
      }

      event.target.complete();

      if (
        (!this.mostrarPlantas && this.displayedAnimals.length >= this.animales.length) ||
        (this.mostrarPlantas && this.displayedPlantas.length >= this.plantas.length)
      ) {
        if (this.infiniteScroll) {  // Verifica que infiniteScroll esté definido
          this.infiniteScroll.disabled = true;
        }
      }
    }, 1000);
  }

  enableInfiniteScroll() {
    if (this.infiniteScroll) {  // Verifica que infiniteScroll esté definido
      this.infiniteScroll.disabled = false;
    }
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

  goToItem(item: Animal | Planta) {
    const route = 'familia' in item ? '/planta-info' : '/animal-info';
    this.router.navigate([route, item.id]);
    this.searchTerm = '';
    this.filteredItems = [];
  }

  toggleMostrarPlantas() {
    this.mostrarPlantas = !this.mostrarPlantas;
    if (this.mostrarPlantas) {
      this.displayedPlantas = this.plantas.slice(0, this.itemsPerPage);
      this.currentPagePlantas = 1;
    } else {
      this.displayedAnimals = this.animales.slice(0, this.itemsPerPage);
      this.currentPageAnimals = 1;
    }
    this.enableInfiniteScroll();
  }
  toggleOrdenRuta() {
    if (this.isSortedByMap) {
      // Restauramos el orden original
      this.displayedAnimals = this.animalesOriginal.slice(0, this.currentPageAnimals * this.itemsPerPage);
      this.displayedPlantas = this.plantasOriginal.slice(0, this.currentPagePlantas * this.itemsPerPage);
    } else {
      // Ordenamos por `posicion_mapa` y solo mostramos el número de elementos visibles
      this.displayedAnimals = [...this.animalesOriginal]
        .sort((a, b) => a.posicion_mapa - b.posicion_mapa)
        .slice(0, this.currentPageAnimals * this.itemsPerPage);

      this.displayedPlantas = [...this.plantasOriginal]
        .sort((a, b) => a.posicion_mapa - b.posicion_mapa)
        .slice(0, this.currentPagePlantas * this.itemsPerPage);
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
          this.router.navigate(['/animal-info', result]);
        } else {
          this.animalsService.getPlantaById(result).subscribe((planta) => {
            if (planta) {
              this.router.navigate(['/planta-info', result]);
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
