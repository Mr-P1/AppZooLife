
import { inject, Injectable } from '@angular/core';
import {collection,collectionData,Firestore,} from '@angular/fire/firestore';
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

  getMapa(): Observable<Mapa[]> {
    return collectionData(this._rutaMapa, { idField: 'id' }) as Observable<Mapa[]>;
  }



}
