import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private router: Router) {
    // Escucha cuando se presiona una notificación
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      // Redirige a la página de trivia si la notificación tiene el identificador adecuado
      if (notification.notification.extra?.redireccion === 'trivia') {
        this.router.navigate(['/adulto/trivia']);
      }
    });
  }
  async mostrarNotificacion(titulo: string, mensaje: string) {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: titulo,
          body: mensaje,
          id: new Date().getTime(),
          schedule: { at: new Date(Date.now() + 1000) }, // Opcional: programar después de un segundo
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }

}
