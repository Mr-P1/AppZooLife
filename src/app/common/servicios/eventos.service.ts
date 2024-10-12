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

export interface evento {

  id: string,
  nombre_evento: string,
  imagen: string,
  descripcion: string,
  fecha_inicio: string,
  hora_inicio:string,
  fecha_termino: string,
  hora_termino:string
}


const PATH_Eventos = 'Eventos';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private _firestore = inject(Firestore);
  private _rutaEventos = collection(this._firestore, PATH_Eventos);


  getEventos(): Observable<evento[]> {
    return collectionData(this._rutaEventos, { idField: 'id' }) as Observable<evento[]>;
  }

  getEvento(id: string): Observable<evento | null> {
    const docRef = doc(this._rutaEventos, id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } as evento : null)
    );
  }





}
