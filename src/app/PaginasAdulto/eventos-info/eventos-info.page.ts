import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonPopover, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import {EventoService,evento} from '../../common/servicios/eventos.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

@Component({
  selector: 'app-eventos-info',
  templateUrl: './eventos-info.page.html',
  styleUrls: ['./eventos-info.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonList, IonPopover, IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EventosInfoPage implements OnInit {

  evento$: Observable<evento | null> | undefined;

  constructor(
    private _eventoService: EventoService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const userId = this.authService.currentUserId;

    if (id) {
      this.evento$ = this._eventoService.getEvento(id);

    }
  }

}
