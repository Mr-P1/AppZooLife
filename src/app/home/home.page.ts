import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonIcon, IonItem, IonRow, IonCol, IonList, IonGrid, IonCardTitle, IonCard, IonSegmentButton, IonLabel, IonSegment } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonSegment, IonLabel, IonSegmentButton, IonCard, IonCardTitle, IonGrid, IonList, RouterModule
    ,IonCol, IonRow, IonItem, IonIcon, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  constructor() {}
}
