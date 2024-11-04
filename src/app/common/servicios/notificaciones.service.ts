import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular'

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


  private token: string | null = null;

  // Guarda el token temporalmente
  setToken(token: string) {
    this.token = token;
  }

  // Retorna el token guardado
  getToken() {
    return this.token;
  }
  private fcmToken: string | null = null;


  async initPush(): Promise<boolean> {
    console.log('Inicializando notificaciones push');

    // Solicita permisos para recibir notificaciones push
    const result = await PushNotifications.requestPermissions();

    // Si el usuario no concede el permiso, muestra una advertencia y retorna false
    if (result.receive !== 'granted') {
      alert('Necesitas habilitar las notificaciones para continuar. Por favor, acepta los permisos.');
      return false;
    }

    // Registra el dispositivo para obtener el token FCM
    PushNotifications.register();

    // Espera a que se registre el token FCM
    const token = await new Promise<string | null>((resolve) => {
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Token de notificación registrado:', token.value);
        this.fcmToken = token.value;
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error en el registro de notificaciones:', error);
        resolve(null);
      });
    });

    if (!token) {
      alert('No se pudo obtener el token de notificación. Inténtalo de nuevo.');
      return false;
    }

    return true; // Permisos otorgados y token obtenido
  }



}
