import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  constructor(private firestore: Firestore) {}

  // Retorna un Observable o Promise
  addRating(rating: number, comments: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (comments.trim() === '') {
          throw new Error('El comentario no puede estar vacío');
        }

        const ratingRef = collection(this.firestore, 'ratings');
        await addDoc(ratingRef, {
          rating,
          comments: comments.trim(),
          date: new Date()
        });

        console.log('Calificación guardada con éxito');
        resolve();
      } catch (error) {
        console.error('Error al guardar la calificación:', error);
        reject(error);
      }
    });
  }
}
