
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonImg } from '@ionic/angular/standalone';
import { StorageService } from './../../common/servicios/storage.service';
import { FirestoreService } from '../../common/servicios/firestore.service';
import PinchZoom from 'pinch-zoom-js';
import { Animal } from 'src/app/common/models/animal.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mapa-nino',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MapaPage implements OnInit , AfterViewInit {

  animales: Animal[] = [];
  imageUrl: string | undefined;

  constructor(
    private storageService: StorageService,
    private animalsService: FirestoreService,
    private router: Router) { }

  ngOnInit(): void {
    const imagePath = 'gs://appzoolife.appspot.com/mapas/MAPA-BZ_2024.jpg';

    this.storageService.getImageUrl(imagePath).then((url) => {
      this.imageUrl = url;
    }).catch((error) => {
      console.error('Error getting image URL:', error);
    });
  }

  ngAfterViewInit(): void {
    const zoomContainer = document.getElementById('zoom-container');
    if (zoomContainer) {
      const pinchZoom = new PinchZoom(zoomContainer, {
        tapZoomFactor: 2,
        zoomOutFactor: 1.3,
        animationDuration: 300,
        draggableUnzoomed: false,
        setOffsetsOnce: true,
        use2d: true
      });
    }

    this.animalsService.getAnimales().subscribe((data: Animal[]) => {
      this.animales = data;
    })
  }


  goToAnimal(posicionMapa: number): void {
    // Busca el animal correspondiente a la posición en el mapa
    const animal = this.animales.find(a => a.posicion_mapa === posicionMapa);

    if (animal) {
      this.router.navigate([`/animal-info-nino/${animal.id}`]);
    } else {
      console.error('Animal no encontrado para la posición: ', posicionMapa);
    }
  }


}
