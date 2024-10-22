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

  animales: Animal[] = [];
  plantas: Planta[] = [];
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
    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
      this.animalesOriginal = [...data];
    });

    this.animalsService.getPlantas().subscribe((data: Planta[]) => {
      this.plantas = data;
      this.plantasOriginal = [...data];
    });

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadAnimalsWithReactions();
      }
    });

    console.log(localStorage.getItem("tipo"))
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
    // Si el objeto tiene la propiedad 'familia', se asume que es una planta, de lo contrario es un animal
    const route = 'familia' in item ? '/planta-info' : '/animal-info';
    this.router.navigate([route, item.id]);
    this.searchTerm = '';
    this.filteredItems = [];
  }

  toggleMostrarPlantas() {
    this.mostrarPlantas = !this.mostrarPlantas;
  }

  // Alterna entre ordenar por posición y restaurar el orden original
  toggleOrdenRuta() {
    if (this.isSortedByMap) {
      // Restaurar el orden original
      this.animales = [...this.animalesOriginal];
      this.plantas = [...this.plantasOriginal];
    } else {
      // Ordenar por 'posicion_mapa'
      this.animales.sort((a, b) => a.posicion_mapa - b.posicion_mapa);
      this.plantas.sort((a, b) => a.posicion_mapa - b.posicion_mapa);
    }
    this.isSortedByMap = !this.isSortedByMap; // Cambiar el estado
  }

  toggleQrScan() {
    this.isScanning = !this.isScanning;
    if (!this.isScanning && this.scanner) {
      this.scanner.reset();
    }
  }

  // onCodeResult(result: string) {
  //   console.log('Contenido escaneado:', result);
  //   this.isScanning = false;


  //   if (result) {
  //     if (this.scanner) {
  //       this.scanner.reset();
  //     }
  //     this.router.navigate(['/animal-info/', result]);
  //   } else {
  //     if (this.scanner) {
  //       this.scanner.reset();
  //     }
  //   }
  // }

  onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);
    this.isScanning = false;

    if (result) {
      if (this.scanner) {
        this.scanner.reset();
      }

      // Verificamos si el ID pertenece a un animal o una planta
      this.animalsService.getAnimalById(result).subscribe((animal) => {
        if (animal) {
          // Si se encuentra un animal con ese ID, redirigir a /animal-info
          this.router.navigate(['/animal-info', result]);
        } else {
          // Si no es un animal, buscamos en plantas
          this.animalsService.getPlantaById(result).subscribe((planta) => {
            if (planta) {
              // Si se encuentra una planta con ese ID, redirigir a /planta-info
              this.router.navigate(['/planta-info', result]);
            } else {
              // Si no se encuentra ni un animal ni una planta, mostrar un mensaje de error o manejo adicional
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

  // extractAnimalId(result: string): string | null {
  //   console.log('Procesando URL:', result);
  //   const regex = /animal-info\/(\w+)/;
  //   const match = result.match(regex);
  //   return match ? match[1] : null;
  // }

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



}
