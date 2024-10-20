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
