export interface PreguntaTrivia {
  id: string;
  pregunta: string;
  respuestas: { a: string, b: string, c: string, d: string };
  respuesta_correcta: string;
  tipo: string;
  genero_usuario:string;
  respondida?: boolean;  // Nuevo campo opcional para verificar si la pregunta ha sido respondida
  respuestaCorrecta?: boolean;  // Nuevo campo opcional para verificar si la respuesta fue correcta
}

export interface PremioUsuario {
  id: string;
  codigo: string;
  estado: boolean;
  premioId: string;
  usuarioId: string;
}

export interface Premio {
  cantidad: number;
  descripcion: string;
  imagen: string;
  nombre: string;
  puntos_necesarios: number;
}

export interface TriviaVisita{
  userId: string;           // ID del usuario que realiza la visita
  fecha: Date;            // Fecha de la visita en formato "YYYY-MM-DD"
  triviaRealizada: boolean; // Indicador de si realizó la trivia
  completada?: boolean;     // Indicador opcional de si completó la trivia
  respuestasCorrectas: number; // Número de respuestas correctas (0 si no realizó la trivia)
  puntosGanados: number;    // Puntos obtenidos en la trivia (0 si no realizó la trivia)
  nivelGanado: number;      // Niveles ganados en la trivia (0 si no realizó la trivia)
}
