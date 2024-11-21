import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController) {
    this.checkAlertTime();
   }

   async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Cerrar'],
    });

    await alert.present();
  }

  checkAlertTime() {
    const alertConfigs = [
      { hour: 14, minute: 27, header: '¡Promoción Especial de Hoy! 🍦', message: '¡Presenta nuestra app en caja y disfruta de todos los helados 2x1! No pierdas esta oportunidad para compartir el doble de sabor, solo por tiempo limitado.' },
      { hour: 22, minute: 19, header: '¡Hora de un Snack! 🍔', message: 'Presenta nuestra app y recibe un descuento especial en todos los combos de la tarde. ¡Aprovecha esta deliciosa oferta para recargar energías! Solo disponible hoy, ¡no te lo pierdas!.' }
    ];

    setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      for (const config of alertConfigs) {
        if (currentHour === config.hour && currentMinute === config.minute) {
          this.presentAlert(config.header, config.message);
          break;
        }
      }
    }, 60000); // Verifica cada minuto
  }
}
