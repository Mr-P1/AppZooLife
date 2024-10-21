import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OirsService, oirs } from '../../common/servicios/oirs.service';
import { AuthService } from '../../common/servicios/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-historial-oirs',
  templateUrl: './historial-oirs.page.html',
  styleUrls: ['./historial-oirs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class HistorialOirsPage implements OnInit {
  oirsList: oirs[] = []; // Lista para almacenar las solicitudes OIRS

  constructor(
    private _oirsService: OirsService,
    private _authService: AuthService
  ) {}

  ngOnInit() {
    const userId = this._authService.currentUserId;

    if (userId) {
      this._oirsService.getOirsUsuario(userId).subscribe({
        next: (data) => {
          this.oirsList = data;
          console.log('Historial cargado:', this.oirsList);
        },
        error: (err) => console.error('Error al cargar el historial:', err)
      });
    }
  }
}
