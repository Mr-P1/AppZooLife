import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  constructor() {
  }

  async mostrarNotificacion(titulo: string, mensaje: string) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === 'granted') {
      console.log('Permiso de notificación concedido, programando notificación');
      await LocalNotifications.schedule({
        notifications: [
          {
            title: titulo,
            body: mensaje,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: ""
          }
        ]
      });
      console.log('Notificación programada');
    } else {
      console.warn('Permiso de notificación no concedido');
    }
  }
}
