import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular'
import { AlertController } from '@ionic/angular';
import { NotificacionesService } from '../app/common/servicios/notificaciones.service'
import { register } from 'swiper/element/bundle';
import { AlertService } from './common/servicios/alert.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private alertService: AlertService,
    private platform: Platform,
    private notificacionesService: NotificacionesService,
    private alertController: AlertController
  ) {
    if (this.platform.is('capacitor')) this.initPush()

  }

  //  initPush() {
  //     console.log('Initializing HomePage');

  //    //Permiso para aceptar las notificaciones
  //     PushNotifications.requestPermissions().then(result => {
  //       if (result.receive === 'granted') {
  //         // Register with Apple / Google to receive push via APNS/FCM
  //         PushNotifications.register();
  //       } else {
  //         // Show some error
  //       }
  //     });

  //    //Añade al usuario para que reciba las notificaciones
  //     PushNotifications.addListener('registration',
  //       (token: Token) => {

  //       }
  //     );

  //     // Some issue with our setup and push will not work
  //     PushNotifications.addListener('registrationError',
  //       (error: any) => {

  //       }
  //     );

  //     // Show us the notification payload if the app is open on our device
  //     PushNotifications.addListener('pushNotificationReceived',
  //       (notification: PushNotificationSchema) => {
  //         alert(notification.title);
  //         alert(JSON.stringify(notification))
  //       }
  //     );

  //     // Method called when tapping on a notification
  //     PushNotifications.addListener('pushNotificationActionPerformed',
  //       (notification: ActionPerformed) => {

  //       }
  //     );
  //   }


  initPush() {
    console.log('Inicializando notificaciones push');

    // Solicita permisos para recibir notificaciones push
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register(); // Se registra con APNS/FCM
      }
    });

    // Obtiene el token del dispositivo
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token de notificación:', token.value);
      // Guarda el token temporalmente en el servicio
      this.notificacionesService.setToken(token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error en el registro de notificaciones:', error);
    });


    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert(notification)
        alert(notification.title);
        const title = notification.title || notification.data?.title || 'Sin título';
        const message = notification.body || notification.data?.body || 'Sin contenido';
        this.presentNotificationAlert(title, message);
      }
    );



  }



  async presentSecondAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          cssClass: 'alert-button-close'
        },
        {
          text: 'Ver más',
          cssClass: 'alert-button-more',
          handler: () => {
            console.log('Ver más clicked');
          }
        }
      ]
    });

    await alert.present();
  }

  // Function to display the custom alert with delay before interaction
  async presentNotificationAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
    });

    await alert.present();

    // Automatically dismiss the alert after 4 seconds, then show a second alert with buttons enabled
    setTimeout(async () => {
      await alert.dismiss();
      // Optional: Show a second alert with active buttons
      this.presentSecondAlert(title, message);
    }, 4000);
  }


}
