import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore, collection, addDoc, collectionData, doc, getDoc, updateDoc, query,
  where, deleteDoc, getDocs, orderBy, limit, startAfter, DocumentData,
  startAt, setDoc,
  onSnapshot
} from '@angular/fire/firestore';

import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { catchError, Observable, tap, throwError, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Noticia {
  id: string;
  titulo: string;
  imagen: string;
  descripcion: string;
  fecha: string; // Mantén esto si se usa para la fecha de publicación.
  fecha_publicacion?: string; // Asegúrate de incluir esto si es necesario
}

const PATH_Noticias = 'Noticias';

@Injectable({
  providedIn: 'root',
})
export class NoticiasService {
  private _firestore = inject(Firestore);
  private _rutaNoticias = collection(this._firestore, PATH_Noticias);

  // Método para obtener todas las noticias
  getNoticias(): Observable<Noticia[]> {
    return collectionData(this._rutaNoticias, { idField: 'id' }) as Observable<Noticia[]>;
  }

  // Método para obtener una noticia específica por ID
  getNoticia(id: string): Observable<Noticia | null> {
    const docRef = doc(this._rutaNoticias, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as Noticia : null)
    );
  }

  addNoticia(noticia: Noticia): Observable<void> {
    return from(addDoc(this._rutaNoticias, noticia)).pipe(
      map(() => {
        return; // Retorna void explícitamente
      }),
      catchError((error) => {
        console.error('Error al agregar noticia:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  // Método para actualizar una noticia existente
  updateNoticia(id: string, noticia: Partial<Noticia>): Observable<void> {
    const docRef = doc(this._rutaNoticias, id);
    return from(updateDoc(docRef, noticia)).pipe(
      catchError((error) => {
        console.error('Error al actualizar noticia:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para eliminar una noticia por ID
  deleteNoticia(id: string): Observable<void> {
    const docRef = doc(this._rutaNoticias, id);
    return from(deleteDoc(docRef)).pipe(
      catchError((error) => {
        console.error('Error al eliminar noticia:', error);
        return throwError(() => error);
      })
    );
  }
}

