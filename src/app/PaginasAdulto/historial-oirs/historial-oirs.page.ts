// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule } from '@ionic/angular';
// import { FormsModule } from '@angular/forms';
// import { OirsService, oirs } from '../../common/servicios/oirs.service';
// import { AuthService } from '../../common/servicios/auth.service';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-historial-oirs',
//   templateUrl: './historial-oirs.page.html',
//   styleUrls: ['./historial-oirs.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule, RouterLink]
// })
// export class HistorialOirsPage implements OnInit {
//   oirsList: oirs[] = []; // Lista para almacenar las solicitudes OIRS

//   constructor(
//     private _oirsService: OirsService,
//     private _authService: AuthService
//   ) {}

//   ngOnInit() {
//     const userId = this._authService.currentUserId;

//     if (userId) {
//       this._oirsService.getOirsUsuario(userId).subscribe({
//         next: (data) => {
//           this.oirsList = data;
//           console.log('Historial cargado:', this.oirsList);
//         },
//         error: (err) => console.error('Error al cargar el historial:', err)
//       });
//     }
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OirsService, oirs } from '../../common/servicios/oirs.service';
import { AuthService } from '../../common/servicios/auth.service';
import { RouterLink } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-historial-oirs',
  templateUrl: './historial-oirs.page.html',
  styleUrls: ['./historial-oirs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class HistorialOirsPage implements OnInit {
  oirsList: (oirs & { fechaEnvioFormatted?: string })[] = []; // Lista para almacenar las solicitudes OIRS

  constructor(
    private _oirsService: OirsService,
    private _authService: AuthService
  ) {}

  ngOnInit() {
    const userId = this._authService.currentUserId;

    if (userId) {
      this._oirsService.getOirsUsuario(userId).subscribe({
        next: (data) => {
          this.oirsList = data.map((oir) => ({
            ...oir,
            fechaEnvioFormatted: this.formatTimestampToDate(oir.fechaEnvio)
          }));
          console.log('Historial cargado:', this.oirsList);
        },
        error: (err) => console.error('Error al cargar el historial:', err)
      });
    }
  }

  formatTimestampToDate(timestamp: Timestamp): string {
    const date = new Date(timestamp.seconds * 1000);
    // Formatear la fecha como día/mes/año
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
