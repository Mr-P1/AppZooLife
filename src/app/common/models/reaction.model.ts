export interface Reaction {
  id?: string;
  animalId: string;
  userId: string;
  reaction: boolean;
  fecha: Date;
  tipo?: string; // Añadimos esta propiedad opcional
}
