
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonImg } from '@ionic/angular/standalone';
import { StorageService } from './../../common/servicios/storage.service';
import { FirestoreService } from '../../common/servicios/firestore.service';
import PinchZoom from 'pinch-zoom-js';
import { Animal } from 'src/app/common/models/animal.model';
import { Router } from '@angular/router';
import {MapaService,Mapa} from '../../common/servicios/mapa.service'

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MapaPage implements OnInit , AfterViewInit {

  animales: Animal[] = [];
  imageUrl: string | undefined;
  mapa :Mapa[] = []
  rutaMapa:string  =""

  constructor(
    private storageService: StorageService,
    private animalsService: FirestoreService,
    private router: Router,
    private mapaService:MapaService,
  ) { }

  ngOnInit(): void {


      // Obtener el único documento de la colección Mapa
      this.mapaService.getMapa().subscribe((mapas: Mapa[]) => {
        if (mapas.length > 0) {
          const mapa = mapas[0]; // Obtener el primer y único mapa
          this.mapa = [mapa]; // Almacena el mapa en el array para el binding

          // Obtener la URL de la imagen del mapa
          this.mapaService.getImageUrl(mapa.imagen).then((url) => {
            this.imageUrl = url; // Asigna la URL de descarga a `imageUrl`
          }).catch((error) => {
            console.error('Error al obtener la URL de la imagen:', error);
          });
        } else {
          console.error('No se encontró ningún mapa en la colección.');
        }
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
      this.router.navigate([`/animal-info/${animal.id}`],{ queryParams: { metodo: 'mapa' } });
    } else {
      console.error('Animal no encontrado para la posición: ', posicionMapa);
    }
  }

}
