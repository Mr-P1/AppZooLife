import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { leafOutline,pawOutline} from 'ionicons/icons';import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Mapa, MapaService } from '../../common/servicios/mapa.service';
import { Planta } from 'src/app/common/models/plantas.model';
import { AlertController } from '@ionic/angular';


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
  private alertController = inject(AlertController);

  animales: Animal[] = [];
  plantas: Planta[] = [];
  userId: string = '';
  filteredAnimals: Animal[] = []; // Lista de animales filtrados
  searchTerm: string = ''; // Para almacenar el término de búsqueda
  mapa: Mapa[] = [];
  mostrarPlantas: boolean = false;


  animalesOriginal: Animal[] = []; // Guardar el orden original
  plantasOriginal: Planta[] = [];

  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isSortedByMap: boolean = false; // Controla si está ordenado por posición



  constructor(
    private animalsService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private _mapaService: MapaService,

  ) {
    addIcons({ leafOutline,pawOutline});
  }

  ngOnInit(): void {

    this.checkAlertTime();

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

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Cerrar'],
    });

    await alert.present();
  }

  checkAlertTime() {
    // Configura las horas objetivo con sus respectivos mensajes y títulos
    const alertConfigs = [
      { hour: 22, minute: 18, header: '¡Promoción Especial de Hoy! 🍦', message: '¡Presenta nuestra app en caja y disfruta de todos los helados 2x1! No pierdas esta oportunidad para compartir el doble de sabor, solo por tiempo limitado.' },
      { hour: 22, minute: 19, header: '¡Hora de un Snack! 🍔', message: 'Presenta nuestra app y recibe un descuento especial en todos los combos de la tarde. ¡Aprovecha esta deliciosa oferta para recargar energías! Solo disponible hoy, ¡no te lo pierdas!.' }
    ];

    setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Verifica si la hora actual coincide con alguna de las configuraciones de alerta
      for (const config of alertConfigs) {
        if (currentHour === config.hour && currentMinute === config.minute) {
          this.presentAlert(config.header, config.message);
          break;
        }
      }
    }, 60000); // Verifica cada minuto
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
    this.router.navigate(['/animal-info-nino', animalId]);
    this.searchTerm = '';
    this.filteredAnimals = [];
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

  toggleMostrarPlantas() {
    this.mostrarPlantas = !this.mostrarPlantas;
  }

  toggleVideoPlanta(planta: Planta) {
    // Alternar el estado de mostrarVideo
    planta.mostrarVideo = !planta.mostrarVideo;
  }

  videoEndedPlanta(planta: Planta) {
    // Cambiar mostrarVideo a false cuando el video termine
    planta.mostrarVideo = false;
  }
}
