import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { TriviaVisita } from '../models/trivia.models';
import { Observable, from } from 'rxjs';

const PATH_TRIVIA_VISITA = 'TriviaVisitas';

@Injectable({
  providedIn: 'root'
})
export class TriviaVisitaService {
  private _firestore = inject(Firestore);
  private _rutaTriviaVisita = collection(this._firestore, PATH_TRIVIA_VISITA);

  constructor() {}

  // Guardar la visita inicial
  guardarTriviaVisita(triviaVisita: TriviaVisita): Observable<void> {
    // Convertir fecha a cadena en formato YYYY-MM-DD
    const fechaStr = this.formatearFecha(triviaVisita.fecha);
    const triviaDocRef = doc(this._rutaTriviaVisita, `${triviaVisita.userId}_${fechaStr}`);

    return from(setDoc(triviaDocRef, { ...triviaVisita, fecha: fechaStr }));
  }

  // Actualizar el estado de la trivia si el usuario la completa
  actualizarTriviaVisita(userId: string, fecha: Date, actualizacion: Partial<TriviaVisita>): Observable<void> {
    // Convertir fecha a cadena en formato YYYY-MM-DD
    const fechaStr = this.formatearFecha(fecha);
    const triviaDocRef = doc(this._rutaTriviaVisita, `${userId}_${fechaStr}`);

    return from(updateDoc(triviaDocRef, actualizacion));
  }

  // Función para convertir Date a string en formato YYYY-MM-DD
  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}
