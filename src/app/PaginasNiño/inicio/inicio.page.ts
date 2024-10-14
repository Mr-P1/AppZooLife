// import { Component, OnInit } from '@angular/core';
// import { FirestoreService } from '../../common/servicios/firestore.service';
// import { Animal } from '../../common/models/animal.model';
// import { Reaction } from 'src/app/common/models/reaction.model';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink } from '@angular/router';
// import { AuthService } from './../../common/servicios/auth.service';
// import { IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonCardHeader, IonButton, IonCardTitle, IonCard} from "@ionic/angular/standalone";
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import Swiper from 'swiper';

import { Component, OnInit, ViewChild } from '@angular/core';
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
import { star, personCircle, chevronUpCircle, document, colorPalette, globe, qrCodeOutline, earthOutline, mapOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-inicio-nino',
  templateUrl: './inicio.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonCard, IonCardTitle, IonButton, IonCardHeader, IonLabel, IonItem, IonList, IonSearchbar, IonContent, CommonModule, RouterLink,]
})
export class InicioPage implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;

  animales: Animal[] = [];
  userId: string = '';
  filteredAnimals: Animal[] = []; // Lista de animales filtrados
  searchTerm: string = ''; // Para almacenar el término de búsqueda



  animalesOriginal: Animal[] = []; // Guardar el orden original

  isScanning: boolean = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isSortedByMap: boolean = false; // Controla si está ordenado por posición


  imagenes = [
    'assets/slides/Slide1.jpg',
    'assets/slides/Slide2.jpg',
    'assets/slides/Slide3.jpg',
    'assets/slides/Slide4.jpg',
  ];


  constructor(
    private animalsService: FirestoreService,
    private authService: AuthService,
    private router: Router

  ) { }

  ngOnInit(): void {

    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
    })

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        // Cargar los animales y luego las reacciones del usuario
        this.loadAnimalsWithReactions();
      }
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
      // Actualiza el estado de la UI inmediatamente
      animal.reaccion = true;

      // Luego realiza la operación en Firestore
      this.animalsService.getUserReaction(animalId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          // Actualiza la reacción en Firestore
          this.animalsService.updateReaction(existingReaction.id, { reaction: true }).subscribe(() => {
            console.log('Reacción actualizada a Like');
          });
        } else {
          // Crea una nueva reacción en Firestore
          const reaction: Reaction = {
            animalId: animalId,
            userId: this.userId,
            fecha: new Date(),
            reaction: true
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
      // Actualiza el estado de la UI inmediatamente
      animal.reaccion = false;

      // Luego realiza la operación en Firestore
      this.animalsService.getUserReaction(animalId, this.userId).subscribe(existingReaction => {
        if (existingReaction && existingReaction.id) {
          // Actualiza la reacción en Firestore
          this.animalsService.updateReaction(existingReaction.id, { reaction: false }).subscribe(() => {
            console.log('Reacción actualizada a No me gusta');
          });
        } else {
          // Crea una nueva reacción en Firestore
          const reaction: Reaction = {
            animalId: animalId,
            userId: this.userId,
            fecha: new Date(),
            reaction: false
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

  toggleQrScan() {
    this.isScanning = !this.isScanning;
    if (!this.isScanning && this.scanner) {
      this.scanner.reset();
    }
  }



}
