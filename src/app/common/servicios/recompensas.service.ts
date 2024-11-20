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

export interface Premios {
  id: string,
  cantidad: number,
  descripcion: string,
  imagen: string,
  nombre: string,
  puntos_necesarios: number,
}


export interface premiosUsuario {
  id: string
  codigo: string,
  estado: boolean
  premioId: string,
  usuarioId: string,
  fecha?: Date

}

export interface Usuario {
  id: string;
  nombre:string,
  correo:string,
  telefono:string,
  genero:string,
  puntos:number,
  nivel:number,
  patente?:string,
  fechaNacimiento:Date,
  region:string,
  comuna:string,
  auth_id:string,
}



const PATH_Recompensas = 'Premios_trivia';
const PATH_RecompensasUsuario = 'PremiosUsuarios';
const PATH_usuario = 'Usuarios';


export type CrearRecompensaUsuario = Omit<premiosUsuario, 'id'>

@Injectable({
  providedIn: 'root',
})
export class RecompensasService {
  private _firestore = inject(Firestore);
  private _rutaRecompensas = collection(this._firestore, PATH_Recompensas);
  private _rutaRecompensasUsuario = collection(this._firestore, PATH_RecompensasUsuario);
  private _rutaUsuario = collection(this._firestore, PATH_usuario);


  getPremios(): Observable<Premios[]> {
    return collectionData(this._rutaRecompensas, { idField: 'id' }) as Observable<Premios[]>;
  }


  getPremiosUsuario(id: string): Observable<premiosUsuario[]> {
    const oirsQuery = query(this._rutaRecompensasUsuario, where('usuarioId', '==', id));
    return collectionData(oirsQuery, { idField: 'id' }) as Observable<premiosUsuario[]>; // Asegura que el ID se incluya
  }


  async canjearPremio(premio: Premios, usuario: any, id: string) {
    try {
      // 1. Actualizar la cantidad del premio en el sistema
      const premioDocRef = doc(this._firestore, `${PATH_Recompensas}/${premio.id}`);
      await updateDoc(premioDocRef, { cantidad: premio.cantidad - 1 });

      // 2. Crear un registro en PremiosUsuario
      const nuevoPremioUsuario: CrearRecompensaUsuario = {
        codigo: `COD-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        estado: true,
        premioId: premio.id,
        usuarioId: id,
        fecha: new Date()
      };

      await addDoc(this._rutaRecompensasUsuario, nuevoPremioUsuario);
    } catch (error) {
      throw new Error('Error al canjear el premio: ' + error);
    }
  }


  async quitarPuntosUsuario(authId: string, puntos: number) {
    try {

      const usuarioQuery = query(this._rutaUsuario, where('auth_id', '==', authId));
      const querySnapshot = await getDocs(usuarioQuery);

      if (!querySnapshot.empty) {
        const usuarioDoc = querySnapshot.docs[0];
        const usuarioData = usuarioDoc.data() as Usuario;
        const nuevosPuntos = usuarioData.puntos - puntos;


        await updateDoc(usuarioDoc.ref, { puntos: nuevosPuntos });
        console.log(`Puntos actualizados correctamente. Puntos restantes: ${nuevosPuntos}`);
      } else {
        console.error('No se encontró el usuario con el auth_id proporcionado');
      }
    } catch (error) {
      console.error('Error al actualizar los puntos del usuario:', error);
    }
  }

  async reclamarPremio(codigo: string) {
    try {
      // Consulta para buscar el documento con el campo `codigo` igual al valor proporcionado
      const q = query(this._rutaRecompensasUsuario, where('codigo', '==', codigo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No se encontró el documento en la colección 'PremiosUsuarios' con el código especificado.");
      }

      // Si se encuentra el documento, actualizamos el estado del primer documento obtenido
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { estado: false });
      console.log('Premio reclamado exitosamente.');
    } catch (error) {
      console.error('Error al reclamar el premio:', error);
    }
  }










}
