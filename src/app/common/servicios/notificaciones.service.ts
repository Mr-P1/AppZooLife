import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private fcmToken: string | null = null;

  constructor() {}

  /**
   * Muestra una notificación local con el título y mensaje proporcionados.
   * @param titulo Título de la notificación.
   * @param mensaje Cuerpo de la notificación.
   */
  async mostrarNotificacion(titulo: string, mensaje: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Las notificaciones locales no están disponibles en el entorno web.');
      return;
    }

    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.warn('Permiso de notificación local no concedido.');
      return;
    }

    console.log('Programando notificación local:', { titulo, mensaje });
    await LocalNotifications.schedule({
      notifications: [
        {
          title: titulo,
          body: mensaje,
          id: new Date().getTime(),
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
  }

  /**
   * Inicializa las notificaciones push y gestiona permisos y registro.
   * @returns Promise<boolean> - Indica si los permisos fueron concedidos.
   */
  async initPush(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('PushNotifications no está disponible en el entorno web.');
      return false;
    }

    console.log('Inicializando notificaciones push...');

    const result = await PushNotifications.requestPermissions();
    if (result.receive !== 'granted') {
      console.warn('Permisos de notificación push no concedidos.');
      return false;
    }

    PushNotifications.register();

    // Espera el registro del token FCM
    const token = await new Promise<string | null>((resolve) => {
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Token de notificación registrado:', token.value);
        this.setToken(token.value);
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error en el registro de notificaciones:', error);
        resolve(null);
      });
    });

    if (!token) {
      console.warn('No se pudo obtener el token FCM. Intenta nuevamente.');
      return false;
    }

    return true;
  }

  /**
   * Guarda el token FCM en memoria.
   * @param token Token FCM a guardar.
   */
  setToken(token: string): void {
    this.fcmToken = token;
  }

  /**
   * Devuelve el token FCM almacenado.
   * @returns string | null Token FCM si está disponible.
   */
  getToken(): string | null {
    return this.fcmToken;
  }
}
