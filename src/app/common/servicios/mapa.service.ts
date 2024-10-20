
import { inject, Injectable } from '@angular/core';
import {collection,collectionData,Firestore,} from '@angular/fire/firestore';
import { getDownloadURL, ref,Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';



export interface Mapa {
  id: string,
  imagen: string
}

const PATH_MAPA = 'Mapa';


@Injectable({
  providedIn: 'root',
})
export class MapaService {
  private _firestore = inject(Firestore);
  private _rutaMapa = collection(this._firestore, PATH_MAPA);
  private _storage = inject(Storage);

  getMapa(): Observable<Mapa[]> {
    return collectionData(this._rutaMapa, { idField: 'id' }) as Observable<Mapa[]>;
  }

  getImageUrl(imagePath: string): Promise<string> {
    // Crear una referencia específica al archivo
    const storageRef = ref(this._storage, imagePath);
    // Obtener la URL de descarga del archivo
    return getDownloadURL(storageRef);
  }



}
