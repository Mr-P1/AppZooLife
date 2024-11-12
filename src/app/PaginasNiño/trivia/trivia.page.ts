import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PreguntaTrivia, TriviaVisita } from 'src/app/common/models/trivia.models';
import { FirestoreService } from 'src/app/common/servicios/firestore.service';
import { AuthService } from './../../common/servicios/auth.service';
import { Usuario } from 'src/app/common/models/usuario.model';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonButton, IonCardContent, IonSpinner } from '@ionic/angular/standalone';
import { TriviaVisitaService } from 'src/app/common/servicios/trivia-visita.service';

@Component({
  selector: 'app-trivia',
  templateUrl: './trivia.page.html',
  styleUrls: ['./trivia.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonCardContent, IonButton, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,RouterModule]
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
    private triviaVisitaService: TriviaVisitaService
  ) {}

  ngOnInit() {
    this.tipo = localStorage.getItem('tipo')!;
    this.authService.authState$.subscribe((user) => {
      if (user) {
        console.log('Usuario autenticado:', user);
        this.userId = user.uid;
        this.preguntaService.getUsuarioID(this.userId).subscribe((data: Usuario | null) => {
          if (data) {
            console.log('Datos del usuario obtenidos:', data);
            this.usuario = data;

            // Realizar consultas individuales para identificar el problema
            this.preguntaService.getAnimalesVistosPorUsuario(this.userId).subscribe(animalesVistos => {
              console.log('Animales vistos:', animalesVistos);

              this.preguntaService.getPlantasVistasPorUsuario(this.userId).subscribe(plantasVistas => {
                console.log('Plantas vistas:', plantasVistas);

                this.animalesVistosCount = animalesVistos.length + plantasVistas.length;
                this.puedeHacerTrivia = this.animalesVistosCount >= 5;

                if (this.puedeHacerTrivia) {
                  const visita: TriviaVisita = {
                    userId: this.userId,
                    fecha: new Date(),
                    triviaRealizada: false,
                    completada: false,
                    respuestasCorrectas: 0,
                    puntosGanados: 0,
                    nivelGanado: 0
                  };

                  // Guardar la visita inicial en Firebase
                  this.triviaVisitaService.guardarTriviaVisita(visita).subscribe(() => {
                    console.log('Visita inicial guardada con triviaRealizada: false');
                  });

                  this.verificarTriviaDelDia().then((puedeHacerTriviaHoy) => {
                    if (puedeHacerTriviaHoy) {
                      this.preguntaService.getPreguntasTriviaPorAnimalesVistos(this.userId).subscribe(preguntasAnimales => {
                        console.log('Preguntas de animales:', preguntasAnimales);
                        this.preguntaService.getPreguntasTriviaPorPlantasVistas(this.userId).subscribe(preguntasPlantas => {
                          console.log('Preguntas de plantas:', preguntasPlantas);

                          this.preguntas = [...preguntasAnimales, ...preguntasPlantas];
                          this.rellenarPreguntasRandom(this.tipo);
                          console.log(this.preguntasRandom)
                          this.loading = false; // Finaliza el loading aquí
                        });
                      });
                    } else {
                      console.log('Trivia ya realizada hoy');
                      this.puedeHacerTrivia = false;
                      this.loading = false;
                    }
                  }).catch(error => {
                    console.error('Error en verificarTriviaDelDia:', error);
                    this.loading = false;
                  });
                } else {
                  console.log('No hay suficientes animales o plantas vistos para hacer la trivia');
                  this.loading = false;
                }
              }, error => {
                console.error('Error al obtener plantas vistas:', error);
                this.loading = false;
              });
            }, error => {
              console.error('Error al obtener animales vistos:', error);
              this.loading = false;
            });
          } else {
            console.log('Datos del usuario no encontrados');
            this.loading = false;
          }
        }, error => {
          console.error('Error al obtener datos del usuario:', error);
          this.loading = false;
        });
      } else {
        console.log('Usuario no autenticado');
        this.loading = false;
      }
    });
  }



  // Verificar si el usuario ya hizo trivia hoy
  async verificarTriviaDelDia(): Promise<boolean> {
    const triviaFecha = localStorage.getItem(`triviaFecha-${this.userId}`);
    const hoy = new Date().toISOString().split('T')[0]; // Solo la fecha en formato YYYY-MM-DD

    console.log(  triviaFecha)

    console.log( hoy)
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
    if (this.triviaComenzada && !this.triviaFinalizada) { // Detecta si la trivia fue abandonada solo si comenzó
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

    // Aseguramos que haya 10 preguntas combinadas de animales y plantas
    while (preguntasFiltradas.length < 10) {
      preguntasFiltradas.push(...this.preguntas.filter((pregunta) => pregunta.tipo.toLowerCase() === tipoUsuarioLowerCase));
    }

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
        abandonada: abandonada, // Indica que todas las respuestas son abandonadas
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
        puntosGanados += this.tipo.toLowerCase() === 'niño' ? 5 : 10;
      }
    }

    // Actualizar los puntos y el nivel solo si la trivia se completó
    if (!abandonada) {
      const nuevoPuntaje = this.usuario.puntos + puntosGanados;
      const nuevoNivel = this.usuario.nivel + nivelGanado;
      const hoy = new Date()

      const actualizacion: Partial<TriviaVisita> = {
        triviaRealizada: true,
        completada: true,
        respuestasCorrectas: this.respuestasCorrectas,
        puntosGanados: puntosGanados,
        nivelGanado: nivelGanado
      };

      // Actualizar el estado de la visita al finalizar la trivia
      this.triviaVisitaService.actualizarTriviaVisita(this.userId, hoy, actualizacion).subscribe(() => {
        console.log('Trivia completada y visita actualizada en Firebase');
      });

      this.preguntaService.actualizarUsuario(this.userId, { puntos: nuevoPuntaje, nivel: nuevoNivel }).subscribe(() => {
        console.log('Usuario actualizado correctamente');
      });

      console.log(`Trivia finalizada. Puntos ganados: ${puntosGanados}, Nivel ganado: ${nivelGanado}`);
    } else {
      console.log('Trivia abandonada, no se actualizan puntos ni nivel.');
    }
  }

}
