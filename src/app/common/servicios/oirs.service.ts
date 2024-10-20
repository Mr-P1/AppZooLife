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

export interface oirs {
  id: string,
  archivoEvidencia?:string,
  comuna:string,
  detalles:string,
  esAfectado:boolean,
  fechaEnvio:Date
  region:string,
  tipoSolicitud:string,
  userId:string,
}



const PATH_Oirs = 'Oirs';


export type CrearOirs = Omit<oirs, 'id'>

@Injectable({
  providedIn: 'root',
})
export class OirsService {
  private _firestore = inject(Firestore);
  private _rutaOirs = collection(this._firestore, PATH_Oirs);
  private _storage = inject(Storage); // Agrega Storage



 getOirsUsuario(id: string): Observable<oirs[]> {
  const oirsQuery = query(this._rutaOirs, where('userId', '==', id));
  return collectionData(oirsQuery, { idField: 'id' }) as Observable<oirs[]>;
}


async uploadImage(file: File): Promise<string> {
  const filePath = `Oirs/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
  const storageRef = ref(this._storage, filePath);
  const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
  return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
}




async createOirs(evento: CrearOirs, imagenFile?: File) {
  let imageUrl: string | undefined;

  if (imagenFile) {
    imageUrl = await this.uploadImage(imagenFile);
  }
  const oirsData = {
    ...evento,
    ...(imageUrl && { archivoEvidencia: imageUrl })
  };
  return addDoc(this._rutaOirs, oirsData);
}




}
