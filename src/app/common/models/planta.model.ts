export interface Planta {
  id: string;
  altura: string;
  audio: string;
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
  video: string;
  zonas: string;
  reaccion: boolean | null;
  mostrarVideo?: boolean; // Propiedad opcional para mostrar el video
}
