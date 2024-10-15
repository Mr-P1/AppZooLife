export interface Planta {
  id: string,
  altura: string; // Ej: "12 Cm"
  area: string; // Ej: "area_1"
  audio: string; // URL del audio
  cuidados: string;
  curiosidad: string;
  descripcion_1: string;
  descripcion_2: string;
  descripcion_3: string;
  estado: string;
  familia: string; // Ej: "Familia 1"
  floracion: string;
  imagen: string; // URL de la imagen
  importancia: string;
  nombre_cientifico: string; // Ej: "Mejor Planta"
  nombre_comun: string; // Ej: "Planta"
  posicion_mapa: number; // Ej: 21
  precaucion: string;
  usos: string;
  video: string; // URL del video
  zonas: string;
}
