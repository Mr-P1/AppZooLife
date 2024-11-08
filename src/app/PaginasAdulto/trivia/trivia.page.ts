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
  selector: 'app-trivia',
  templateUrl: './trivia.page.html',
  styleUrls: ['./trivia.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonCardContent, IonButton, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class TriviaPage implements OnInit, OnDestroy {

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
  triviaAbandonada: boolean = false; // Nueva variable para controlar si la trivia fue abandonada
  tipo = "";
  tiempoInicio: number = 0; // Tiempo en milisegundos cuando se muestra la pregunta

  constructor(
    private preguntaService: FirestoreService,
    private authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit() {
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
                // Verificar si ya hizo trivia hoy
                this.verificarTriviaDelDia().then((puedeHacerTriviaHoy) => {
                  if (puedeHacerTriviaHoy) {
                    this.preguntaService.getPreguntasTriviaPorAnimalesVistos(this.userId).subscribe((preguntas: PreguntaTrivia[]) => {
                      this.preguntas = preguntas;
                      this.rellenarPreguntasRandom(this.tipo);
                      this.loading = false; // Datos cargados, desactiva la carga
                    });
                  } else {
                    this.puedeHacerTrivia = false; // No puede hacer trivia hoy
                    this.loading = false;
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
      } else {
        this.loading = false; // No puede hacer trivia, pero los datos han cargado
      }
    });
  }

  // Verificar si el usuario ya hizo trivia hoy
  async verificarTriviaDelDia(): Promise<boolean> {
    const triviaFecha = localStorage.getItem(`triviaFecha-${this.userId}`);
    const hoy = new Date().toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD

    if (triviaFecha === hoy) {
      return false; // Ya hizo trivia hoy
    } else {
      return true; // No ha hecho trivia hoy
    }
  }

  comenzarTrivia() {
    this.triviaComenzada = true;
    this.mostrarPregunta();
  }

  ngOnDestroy() {
    if (!this.triviaFinalizada) { // Detecta si la trivia fue abandonada
      this.triviaAbandonada = true;
      const hoy = new Date().toISOString().split('T')[0];
      localStorage.setItem(`triviaFecha-${this.userId}`, hoy);
      this.guardarRespuestas(true); // Guardamos respuestas con `abandonada: true`
    }
    clearInterval(this.temporizador);
  }

  mostrarPregunta() {
    if (this.preguntaIndex < this.preguntasRandom.length) {
      this.preguntaActual = this.preguntasRandom[this.preguntaIndex];
      this.preguntaIndex++;
      this.tiempoInicio = Date.now(); // Guardamos el tiempo en el que se muestra la pregunta
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

    const tiempoRespuesta = (Date.now() - this.tiempoInicio) / 1000; // Tiempo en segundos

    if (pregunta.respuestaCorrecta) {
      this.respuestasCorrectas++;
    }

    clearInterval(this.temporizador);
    setTimeout(() => this.mostrarPregunta(), 1000); // Mostramos la siguiente pregunta tras 1 segundo
  }

  rellenarPreguntasRandom(tipoUsuario: string) {
    const tipoUsuarioLowerCase = tipoUsuario.toLowerCase();
    const preguntasFiltradas = this.preguntas.filter((pregunta) => pregunta.tipo.toLowerCase() === tipoUsuarioLowerCase);

    // Aseguramos que siempre haya 10 preguntas, aunque el filtro retorne menos
    while (preguntasFiltradas.length < 10) {
      preguntasFiltradas.push(...this.preguntas.filter((pregunta) => pregunta.tipo.toLowerCase() === tipoUsuarioLowerCase));
    }

    // Mezclamos las preguntas y seleccionamos las primeras 10
    this.preguntasRandom = this.shuffleArray(preguntasFiltradas).slice(0, 10);
  }

  shuffleArray(array: PreguntaTrivia[]): PreguntaTrivia[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  finalizarTrivia() {
    clearInterval(this.temporizador); // Detenemos cualquier temporizador activo
    this.preguntaActual = null; // Oculta la tarjeta de preguntas
    this.triviaFinalizada = true; // Muestra la tarjeta de resultados
    this.guardarRespuestas(false); // Guarda las respuestas con abandonada: false

    // Guardar la fecha de la trivia en localStorage
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem(`triviaFecha-${this.userId}`, hoy);
  }

  guardarRespuestas(abandonada: boolean) {
    if (!this.usuario || !this.userId) {
      console.error('No se pudo obtener el usuario o userId');
      return;
    }

    let puntosGanados = 0;
    let nivelGanado = 0;

    for (const pregunta of this.preguntasRandom) {
      // Determinamos si la pregunta fue respondida
      const respuestaCorrecta = pregunta.respondida ? pregunta.respuestaCorrecta ?? false : false;

      const respuesta = {
        resultado: respuestaCorrecta,
        user_id: this.userId,
        pregunta_id: pregunta.id,
        fecha: new Date(),
        abandonada: true, // Indica que todas las respuestas son abandonadas
        tiempoRespuesta: pregunta.respondida ? (Date.now() - this.tiempoInicio) / 1000 : 0,
        genero_usuario: this.usuario?.genero,
        tipo: this.tipo
      };

      // Guardar la respuesta en la base de datos
      this.preguntaService.guardarRespuestaTrivia(respuesta).subscribe(() => {
        console.log(`Respuesta guardada con abandonada: ${respuesta.abandonada}, resultado: ${respuesta.resultado}`);
      });

      // Solo aumentamos puntos si fue correcta y no está abandonada (es decir, si fue respondida correctamente)
      if (respuestaCorrecta && !abandonada) {
        nivelGanado += 3; // 3 puntos de nivel por respuesta correcta
        puntosGanados += this.tipo.toLowerCase() === 'adulto' ? 10 : 5;
      }
    }

    // Actualizar los puntos y el nivel solo si la trivia se completó
    if (!abandonada) {
      const nuevoPuntaje = this.usuario.puntos + puntosGanados;
      const nuevoNivel = this.usuario.nivel + nivelGanado;

      this.preguntaService.actualizarUsuario(this.userId, { puntos: nuevoPuntaje, nivel: nuevoNivel }).subscribe(() => {
        console.log('Usuario actualizado correctamente');
      });

      console.log(`Trivia finalizada. Puntos ganados: ${puntosGanados}, Nivel ganado: ${nivelGanado}`);
    } else {
      console.log('Trivia abandonada, no se actualizan puntos ni nivel.');
    }
  }

}
