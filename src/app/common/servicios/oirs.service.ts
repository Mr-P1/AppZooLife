import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Definición de la interfaz para OIRS
export interface oirs {
  id: string;
  archivoEvidencia?: string;
  detalles: string;
  esAfectado: boolean;
  fechaEnvio: Timestamp;
  tipoSolicitud: string;
  userId: string;
  respondido: boolean;
  respuesta?: string;
}

// Tipo para la creación de OIRS sin ID
export type CrearOirs = Omit<oirs, 'id'>;

// Constante para la colección de OIRS en Firestore
const PATH_Oirs = 'Oirs';

@Injectable({
  providedIn: 'root',
})
export class OirsService {
  private _firestore = inject(Firestore);
  private _storage = inject(Storage);
  private _rutaOirs = collection(this._firestore, PATH_Oirs);

  // Obtener las solicitudes OIRS de un usuario específico
  getOirsUsuario(userId: string): Observable<oirs[]> {
    const oirsQuery = query(this._rutaOirs, where('userId', '==', userId));
    return collectionData(oirsQuery, { idField: 'id' }) as Observable<oirs[]>;
  }

  // Subir imagen a Cloud Storage y obtener la URL
  async uploadImage(file: File): Promise<string> {
    const filePath = `Oirs/${file.name}`; // Ruta donde se almacenará la imagen en Cloud Storage
    const storageRef = ref(this._storage, filePath);
    const snapshot = await uploadBytes(storageRef, file); // Sube el archivo
    return getDownloadURL(snapshot.ref); // Obtiene la URL pública de la imagen
  }

  // Crear una nueva solicitud OIRS
  async createOirs(oirsData: CrearOirs, imagenFile?: File): Promise<void> {
    let imageUrl: string | undefined;

    // Subir la imagen si existe y obtener la URL
    if (imagenFile) {
      imageUrl = await this.uploadImage(imagenFile);
    }

    const oirsToSave = {
      ...oirsData,
      ...(imageUrl && { archivoEvidencia: imageUrl }) // Agregar la URL de la imagen si existe
    };

    // Guardar el documento en Firestore
    await addDoc(this._rutaOirs, oirsToSave);
  }





}
