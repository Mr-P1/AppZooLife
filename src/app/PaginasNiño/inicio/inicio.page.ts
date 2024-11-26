import { Component, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Reaction, ReactionPlanta } from 'src/app/common/models/reaction.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { AuthService } from './../../common/servicios/auth.service';
import { IonContent, IonList, IonItem, IonSearchbar, IonLabel, IonCard, IonCardHeader, IonButton, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { leafOutline,pawOutline, arrowUp } from 'ionicons/icons';import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Mapa, MapaService } from '../../common/servicios/mapa.service';
import { Planta } from 'src/app/common/models/plantas.model';



@Component({
  selector: 'app-inicio-nino',
  templateUrl: './inicio.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [ZXingScannerModule,IonCard, IonCardTitle, IonButton, IonCardHeader, IonLabel, IonItem, IonList, IonSearchbar, IonContent, CommonModule, RouterLink,]
})
export class InicioPage implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;
  @ViewChild(IonContent, { static: false }) contentRef!: IonContent;


  animales: Animal[] = [];
  plantas: Planta[] = [];
  displayedAnimals: Animal[] = []; // Animales visibles actualmente
  displayedPlantas: Planta[] = []; // Plantas visibles actualmente
  itemsPerPage: number = 5; // Número de elementos que se muestran en cada carga
  currentPageAnimals: number = 1; // Página actual para los animales
  currentPagePlantas: number = 1; // Página actual para las plantas
  filteredItems: (Animal | Planta)[] = [];
  userId: string = '';
  filteredAnimals: Animal[] = []; // Lista de animales filtrados
  searchTerm: string = ''; // Para almacenar el término de búsqueda
  mapa: Mapa[] = [];
  mostrarPlantas: boolean = false;
  showScrollToTop: boolean = false; // Controla la visibilidad del botón



  animalesOriginal: Animal[] = []; // Guardar el orden original
  plantasOriginal: Planta[] = [];

  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];



  constructor(
    private animalsService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private _mapaService: MapaService,

  ) {
    addIcons({arrowUp,leafOutline,pawOutline});
  }

  ngOnInit(): void {
    this.loadAnimals();
    this.loadPlantas();

     // Cargar animales y establecer los primeros elementos para mostrar
     this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      if (this.animales.length > 0) {
        this.displayedAnimals = this.animales.slice(0, this.itemsPerPage);
        console.log("Animales cargados:", this.animales);
      }
    });

     // Cargar plantas y establecer los primeros elementos para mostrar
     this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      if (this.plantas.length > 0) {
        this.displayedPlantas = this.plantas.slice(0, this.itemsPerPage);
        console.log("Plantas cargadas:", this.plantas);
      }
    });

    // Cargar mapa
    this._mapaService.getMapa().subscribe((data: Mapa[]) => {
      this.mapa = data;
    });

    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      this.displayedPlantas = this.plantas.slice(0, this.itemsPerPage);
    });

    this._mapaService.getMapa().subscribe((data: Mapa[]) => {
      this.mapa = data;
    });

    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
    })

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        // Cargar los animales y luego las reacciones del usuario
        this.loadAnimalsWithReactions();
        this.loadPlantsWithReactions();
      }
    });

    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;

    });

  }


  loadAnimals() {
    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      this.displayedAnimals = this.animales.slice(0, this.itemsPerPage);
    });
  }

  loadPlantas() {
    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      this.displayedPlantas = this.plantas.slice(0, this.itemsPerPage);
    });
  }

  loadAnimalsWithReactions() {
    this.animalsService.getAnimales().subscribe((animales: Animal[]) => {
      this.animales = animales;

      // Para cada animal, buscamos la reacción del usuario
      this.animales.forEach(animal => {
        this.animalsService.getUserReaction(animal.id, this.userId).subscribe(reaction => {
          animal.reaccion = reaction ? reaction.reaction : null; // true = like, false = don't like, null = sin reacción
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


  // Método para redirigir a la página de información de la atracción
  goToItem(item: Animal | Planta) {
    const route = 'familia' in item ? '/adulto/planta-info' : '/adulto/animal-info';
    this.router.navigate([route, item.id]);
    this.router.navigate([route, item.id], { queryParams: { metodo: 'searchbar' } });
    this.searchTerm = '';
    this.filteredItems = [];
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



  onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);
    this.isScanning = false;

    if (result) {
      if (this.scanner) {
        this.scanner.reset();
      }
      this.animalsService.getAnimalById(result).subscribe((animal) => {
        if (animal) {
          this.router.navigate(['/nino/animal-info-nino', result],{ queryParams: { metodo: 'qr' } });
        } else {
          this.animalsService.getPlantaById(result).subscribe((planta) => {
            if (planta) {
              this.router.navigate(['/nino/info-plantas-nino', result],{ queryParams: { metodo: 'qr' } });
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

  extractAnimalId(result: string): string | null {
    console.log('Procesando URL:', result);
    const regex = /animal-info\/(\w+)/;
    const match = result.match(regex);
    return match ? match[1] : null;
  }

  toggleQrScan() {
    this.isScanning = !this.isScanning;
    if (!this.isScanning && this.scanner) {
      this.scanner.reset();
    }
  }



  toggleVideo(animal: Animal) {
    // Alternar el estado de mostrarVideo
    animal.mostrarVideo = !animal.mostrarVideo;
  }

  videoEnded(animal: Animal) {
    // Cambiar mostrarVideo a false cuando el video termine
    animal.mostrarVideo = false;
  }

  toggleVideoPlanta(planta: Planta) {
    // Alternar el estado de mostrarVideo
    planta.mostrarVideo = !planta.mostrarVideo;
  }

  videoEndedPlanta(planta: Planta) {
    // Cambiar mostrarVideo a false cuando el video termine
    planta.mostrarVideo = false;
  }

  enableInfiniteScroll() {
    const infiniteScroll = document.querySelector('ion-infinite-scroll');
    if (infiniteScroll) {
      infiniteScroll.disabled = false;
    }
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

    this.filteredItems = []; // Limpia los resultados filtrados
    this.searchTerm = '';    // Reinicia el término de búsqueda
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
        event.target.disabled = true;
      }
    }, 1000);
  }

  scrollToTop() {
    if (this.contentRef) {
      this.contentRef.scrollToTop(500);
    }
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollToTop = scrollTop > 300;
  }


}
