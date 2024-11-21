
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonButton, IonButtons, IonList, IonLabel, IonItem, IonBackButton } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Planta } from './../../common/models/plantas.model';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

@Component({
  selector: 'app-info-planta',
  templateUrl: './info-plantas.page.html',
  styleUrls: ['./info-plantas.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonItem, IonLabel, IonList, IonButtons, IonButton, IonPopover, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class InfoPlantasPage implements OnInit {
  planta$: Observable<Planta | null> | undefined;

  constructor(
    private plantaService: FirestoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const userId = this.authService.currentUserId;

    if (id) {
      this.planta$ = this.plantaService.getPlanta(id);

      if (userId) {
        this.plantaService.usuarioHaVistoPlanta(userId, id).subscribe(haVisto => {
          if (!haVisto) {
            setTimeout(() => {
              this.plantaService.guardarPlantaVista(userId, id).subscribe({
                next: () => console.log('Planta vista guardado exitosamente'),
                error: (error) => console.error('Error al guardar la planta vista', error)
              });
            }, 5000);
          }
        });
      }
    }
  }
}
