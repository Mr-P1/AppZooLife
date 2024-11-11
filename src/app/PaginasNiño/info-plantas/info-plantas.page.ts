import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-info-plantas',
  templateUrl: './info-plantas.page.html',
  styleUrls: ['./info-plantas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InfoPlantasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
