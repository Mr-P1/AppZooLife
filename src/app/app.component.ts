import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NotificacionesService } from '../app/common/servicios/notificaciones.service';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private notificacionesService: NotificacionesService,
    private alertController: AlertController
  ) {
    if (this.platform.is('capacitor')) {
      this.initPush(); // Inicializa las notificaciones push solo si estamos en un dispositivo nativo
    }
  }

  /**
   * Inicializa las notificaciones push, solicita permisos y configura los listeners.
   */
  initPush() {
    console.log('Inicializando notificaciones push...');

    // Solicita permisos para notificaciones push
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register(); // Se registra con APNS/FCM
      } else {
        console.warn('Permisos para notificaciones push no concedidos.');
      }
    });

    // Obtiene el token del dispositivo
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token de notificación recibido:', token.value);
      this.notificacionesService.setToken(token.value); // Guarda el token en el servicio
    });

    // Maneja errores durante el registro
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error en el registro de notificaciones:', error);
    });

    // Maneja notificaciones recibidas mientras la app está en primer plano
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Notificación recibida:', notification);

      const title = notification.title || notification.data?.title || 'Sin título';
      const message = notification.body || notification.data?.body || 'Sin contenido';

      this.presentNotificationAlert(title, message); // Muestra una alerta personalizada con los datos
    });
  }

  /**
   * Muestra una alerta personalizada al recibir una notificación.
   * @param title - Título de la notificación.
   * @param message - Cuerpo de la notificación.
   */
  async presentNotificationAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['Cerrar']
    });

    await alert.present();

    // Dismiss automáticamente después de 4 segundos
    setTimeout(async () => {
      await alert.dismiss();
    }, 4000);
  }
}
