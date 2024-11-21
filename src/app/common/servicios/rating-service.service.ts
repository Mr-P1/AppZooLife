import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  constructor(private firestore: Firestore) {}

  async addRating(rating: number, comments: string) {
    try {
      const ratingRef = collection(this.firestore, 'ratings');
      await addDoc(ratingRef, { rating, comments, date: new Date() });
    } catch (error) {
      console.error('Error al guardar la calificación:', error);
    }
  }
}
