import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service'; // Importar el servicio de autenticación
import { Router } from '@angular/router'; // Para redirigir al login

@Injectable({
  providedIn: 'root'
})
export class ContadorService {
  private tiempoRestante = new BehaviorSubject<number>(8 * 60 * 60); // 8 horas en segundos
  tiempoRestante$ = this.tiempoRestante.asObservable();

  private contadorSub: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarContador() {
    if (this.contadorSub) {
      this.contadorSub.unsubscribe();
    }

    const duracion = this.tiempoRestante.value;

    this.contadorSub = interval(1000)
      .pipe(
        map(segundo => duracion - segundo),
        take(duracion + 1)
      )
      .subscribe({
        next: (valor) => {
          this.tiempoRestante.next(valor);
          // console.log(`Tiempo restante: ${valor}s`);
        },
        complete: () => {
          this.tiempoRestante.next(0);
          this.finalizarSesion();
        }
      });
  }


  async finalizarSesion() {

    await this.authService.logOut();
    this.router.navigate(['login']);
  }

  detenerContador() {
    if (this.contadorSub) {
      this.contadorSub.unsubscribe();
      this.contadorSub = null;
    }
  }
}
