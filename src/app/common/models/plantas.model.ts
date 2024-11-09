export interface Planta {
  id: string;
  altura: string;
  audio?: string; // Para el audio explicativo general
  cuidados: string;
  curiosidad: string;
  descripcion_1: string;
  descripcion_2: string;
  descripcion_3: string;
  estado: string;
  familia: string;
  floracion: string;
  imagen: string;
  importancia: string;
  nombre_cientifico: string;
  nombre_comun: string;
  peso: string;
  posicion_mapa: number;
  precaucion: string;
  usos: string;
  video?: string; // Opcional si tienes videos de plantas
  zonas: string;
  reaccion: boolean | null;
  mostrarVideo?: boolean; // Propiedad opcional para mostrar el video
  audioPlanta?: string; // Para el audio específico de la planta
  area: string; // Esta propiedad es necesaria para el filtrado por área

}
