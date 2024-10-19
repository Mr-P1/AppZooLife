import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PreguntaTrivia } from 'src/app/common/models/trivia.models';
import { FirestoreService } from 'src/app/common/servicios/firestore.service';
import { AuthService } from './../../common/servicios/auth.service';
import { Usuario } from 'src/app/common/models/usuario.model';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonButton, IonCardContent, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-trivia-nino',
  templateUrl: './trivia.page.html',
  styleUrls: ['./trivia.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonCardContent, IonButton, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,RouterModule]
})
export class TriviaPage implements  OnInit, OnDestroy {

  preguntas: PreguntaTrivia[] = [];
  preguntasRandom: PreguntaTrivia[] = [];
  preguntaActual: PreguntaTrivia | null = null;
  preguntaIndex: number = 0;
  tiempoRestante: number = 10; // Tiempo en segundos por pregunta
  circumference: number = 2 * Math.PI * 45; // Circunferencia del círculo (r=45)
  respuestasCorrectas: number = 0;
  temporizador: any;
  usuario: Usuario | null = null;
  userId: string = '';
  animalesVistosCount: number = 0;
  puedeHacerTrivia: boolean = false;
  loading: boolean = true; // Variable para controlar el estado de carga
  triviaComenzada: boolean = false; // Nueva variable para controlar si la trivia ha comenzado
  triviaFinalizada: boolean = false; // Nueva variable para controlar si la trivia ha finalizado

  tipo = "";

  constructor(
    private preguntaService: FirestoreService,
    private authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit() {
    console.log( localStorage.getItem('tipo'))
    this.tipo = localStorage.getItem('tipo')!;
    this.authService.authState$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.preguntaService.getUsuarioID(this.userId).subscribe((data: Usuario | null) => {
          if (data) {
            this.usuario = data;
            this.preguntaService.getAnimalesVistosPorUsuario(this.userId).subscribe((animalesVistos) => {
              this.animalesVistosCount = animalesVistos.length;
              this.puedeHacerTrivia = this.animalesVistosCount >= 5;

              if (this.puedeHacerTrivia) {
                this.preguntaService.getPreguntasTriviaPorAnimalesVistos(this.userId).subscribe((preguntas: PreguntaTrivia[]) => {
                  this.preguntas = preguntas;
                  this.rellenarPreguntasRandom(this.tipo);
                  this.loading = false; // Datos cargados, desactiva la carga
                });
              } else {
                this.loading = false; // No puede hacer trivia, pero los datos han cargado
              }
            });
          } else {
            this.loading = false; // No puede hacer trivia, pero los datos han cargado
          }
        });
      } else {
        this.loading = false; // No puede hacer trivia, pero los datos han cargado
      }
    });
  }

  comenzarTrivia() {
    this.triviaComenzada = true;
    this.mostrarPregunta();
  }


  ngOnDestroy() {
    clearInterval(this.temporizador);
  }

  mostrarPregunta() {
    if (this.preguntaIndex < this.preguntasRandom.length) {
      this.preguntaActual = this.preguntasRandom[this.preguntaIndex];
      this.preguntaIndex++;
      this.iniciarTemporizador();
    } else {
      this.finalizarTrivia(); // Finaliza la trivia
    }
  }

  iniciarTemporizador() {
    this.tiempoRestante = 10; // Reiniciar el temporizador a 10 segundos
    clearInterval(this.temporizador);
    this.temporizador = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        clearInterval(this.temporizador);
        this.mostrarPregunta();
      }
    }, 1000);
  }

  seleccionarRespuesta(pregunta: PreguntaTrivia, respuesta: string) {
    if (pregunta.respondida) return;

    pregunta.respondida = true;
    pregunta.respuestaCorrecta = respuesta === pregunta.respuesta_correcta;

    if (pregunta.respuestaCorrecta) {
      this.respuestasCorrectas++;
    }

    clearInterval(this.temporizador);
    setTimeout(() => this.mostrarPregunta(), 1000); // Mostramos la siguiente pregunta tras 1 segundo

  }

  todasLasPreguntasRespondidas(): boolean {
    return this.preguntasRandom.every((pregunta) => pregunta.respondida);
  }

  rellenarPreguntasRandom(tipoUsuario: string) {
    const tipoUsuarioLowerCase = tipoUsuario.toLowerCase();
    const preguntasFiltradas = this.preguntas.filter((pregunta) => pregunta.tipo.toLowerCase() === tipoUsuarioLowerCase);
    this.preguntasRandom = this.shuffleArray(preguntasFiltradas).slice(0, tipoUsuarioLowerCase === 'adulto' ? 10 : 10);
  }

  shuffleArray(array: PreguntaTrivia[]): PreguntaTrivia[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async enviarRespuestas() {
    if (!this.usuario || !this.userId) {
      console.error('No se pudo obtener el usuario o userId');
      return;
    }

    let puntosGanados = 0;
    let nivelGanado = 0;

    for (const pregunta of this.preguntasRandom) {
      const respuestaCorrecta = pregunta.respuestaCorrecta ?? false;

      const respuesta = {
        resultado: respuestaCorrecta,
        user_id: this.userId,
        pregunta_id: pregunta.id,
        fecha: new Date(),
        genero_usuario:this.usuario.genero,
        tipo:localStorage.getItem('tipo'),
      };

      this.preguntaService.guardarRespuestaTrivia(respuesta).subscribe(() => {
        console.log('Respuesta guardada en Firestore');
      });

      if (respuestaCorrecta) {
        nivelGanado +=  this.tipo.toLowerCase() === 'adulto' ? 3 : 1; ; // 3 niveles si es adulto, 1 nivel si es niño por respuesta correcta
        puntosGanados += this.tipo.toLowerCase() === 'adulto' ? 10 : 3; // 10 puntos si es adulto, 3 puntos si es niño
      }
    }

    const nuevoPuntaje = this.usuario.puntos + puntosGanados;
    const nuevoNivel = this.usuario.nivel + nivelGanado;

    this.preguntaService.actualizarUsuario(this.userId, { puntos: nuevoPuntaje, nivel: nuevoNivel }).subscribe(() => {
      console.log('Usuario actualizado correctamente');
    });

    console.log(`Respuestas guardadas. Puntos ganados: ${puntosGanados}, Nivel ganado: ${nivelGanado}`);
  }

  finalizarTrivia() {
    clearInterval(this.temporizador); // Detenemos cualquier temporizador activo
    this.preguntaActual = null; // Oculta la tarjeta de preguntas
    this.triviaFinalizada = true; // Muestra la tarjeta de resultados
    this.enviarRespuestas(); // Guarda las respuestas, pero no redirige
  }

}
