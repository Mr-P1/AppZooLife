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
