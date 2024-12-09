
import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';

import { orderBy, limit } from '@angular/fire/firestore';

import { Animal } from '../models/animal.model';
import { Reaction, ReactionPlanta } from '../models/reaction.model';
import { Usuario } from '../models/usuario.model';
import { PreguntaTrivia, Premio } from '../models/trivia.models';
import { Planta } from './../models/plantas.model';
import { PremioUsuario } from '../models/trivia.models';

const PATH_ANIMALES = 'Animales';
const PATH_PLANTAS = 'Plantas';
const PATH_REACCIONES = 'Reacciones';
const PATH_REACCIONES_PLANTAS = 'ReaccionesPlantas';
const PATH_USUARIOS = 'Usuarios';
const PATH_ANIMALES_VISTOS = 'AnimalesVistos';
const PATH_PREGUNTAS_TRIVIA = 'Preguntas';
const PATH_RESPUESTAS_TRIVIA = 'RespuestasTrivia';
const PATH_PLANTAS_VISTAS = 'PlantasVistas';
const PATH_PREMIOS_USUARIOS = 'PremiosUsuarios';
const PATH_PREMIOS_TRIVIA = 'Premios_trivia';
const PATH_PREGUNTAS_TRIVIA_PLANTA = 'PreguntasPlantas'

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private _firestore = inject(Firestore);
  private _rutaAnimal = collection(this._firestore, PATH_ANIMALES);
  private _rutaPlantas = collection(this._firestore, PATH_PLANTAS);
  private _rutaReacciones = collection(this._firestore, PATH_REACCIONES);
  private _rutaReaccionesPlantas = collection(this._firestore, PATH_REACCIONES_PLANTAS);
  private _rutaUsuarios = collection(this._firestore, PATH_USUARIOS);
  private _rutaAnimalesVistos = collection(this._firestore, PATH_ANIMALES_VISTOS);
  private _rutaPlantasVistas = collection(this._firestore, PATH_PLANTAS_VISTAS);
  private _preguntasTrivia = collection(this._firestore, PATH_PREGUNTAS_TRIVIA); //Preguntas animales
  private _preguntasTriviaPlantas = collection(this._firestore, PATH_PREGUNTAS_TRIVIA_PLANTA);
  private _respuestasTrivia = collection(this._firestore, PATH_RESPUESTAS_TRIVIA);
  private _rutaPremiosUsuarios = collection(this._firestore, PATH_PREMIOS_USUARIOS);
  private _rutaPremiosTrivia = collection(this._firestore, PATH_PREMIOS_TRIVIA);

  constructor() { }

  // Método para obtener animales
  getAnimales(): Observable<Animal[]> {
    return collectionData(this._rutaAnimal, { idField: 'id' }) as Observable<Animal[]>;
  }

  // Método para obtener un animal por ID
  getAnimal(id: string): Observable<Animal | null> {
    const docRef = doc(this._rutaAnimal, id);
    return from(getDoc(docRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } as Animal : null))
    );
  }

  // Método para obtener reacciones de un usuario por animal
  getUserReaction(animalId: string, userId: string): Observable<Reaction | null> {
    const reactionsQuery = query(
      this._rutaReacciones,
      where('animalId', '==', animalId),
      where('userId', '==', userId)
    );
    return from(getDocs(reactionsQuery)).pipe(
      map((snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as Reaction;
          return { id: snapshot.docs[0].id, ...data } as Reaction;
        }
        return null;
      })
    );
  }

  // Método para actualizar una reacción
  updateReaction(id: string, reaction: Partial<Reaction>): Observable<void> {
    const docRef = doc(this._rutaReacciones, id);
    return from(setDoc(docRef, reaction, { merge: true }));
  }

  // Método para agregar una nueva reacción
  addReaction(reaction: Reaction): Observable<DocumentReference> {
    return from(addDoc(this._rutaReacciones, reaction));
  }

  // Método para obtener un usuario por ID
  getUsuario(id: string): Observable<Usuario | null> {
    const docRef = doc(this._rutaUsuarios, id);
    return from(getDoc(docRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } as Usuario : null))
    );
  }

  // Método para obtener un usuario por auth ID
  getUsuarioID(authId: string): Observable<Usuario | null> {
    const usuariosQuery = query(this._rutaUsuarios, where('auth_id', '==', authId));
    return from(getDocs(usuariosQuery)).pipe(
      map((snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as Usuario;
          const id = snapshot.docs[0].id;
          return { ...docData, id }; // Propaga los datos y agrega el campo 'id'
        }
        return null;
      }),
      catchError((err) => {
        console.error('Error al obtener el usuario:', err);
        return of(null);
      })
    );
  }

  // Método para guardar el animal visto
  guardarAnimalVisto(userId: string, animalId: string, metodoIngreso?: string, area?: string): Observable<void> {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para la fecha actual

    // Consulta para verificar si ya existe un registro del mismo animal, usuario y método en la fecha actual
    const queryRef = query(
      this._rutaAnimalesVistos,
      where('userId', '==', userId),
      where('animalId', '==', animalId),
      where('metodoIngreso', '==', metodoIngreso)
    );

    return from(getDocs(queryRef)).pipe(
      switchMap((snapshot) => {
        const existeHoy = snapshot.docs.some((doc) => {
          const data = doc.data() as any;
          const fechaGuardada = new Date(data.vistoEn.toDate()).toISOString().split('T')[0]; // Convertir Firestore Timestamp a fecha
          return fechaGuardada === hoy;
        });

        if (!existeHoy) {
          // Si no existe un registro en la fecha actual, se guarda el nuevo registro
          const nuevoRegistro = {
            userId,
            animalId,
            area,
            metodoIngreso,
            vistoEn: new Date(), // Fecha y hora actuales
          };

          return from(addDoc(this._rutaAnimalesVistos, nuevoRegistro)).pipe(
            map(() => {
              console.log('Animal visto guardado con éxito.');
            })
          );
        } else {
          console.log(`El animal ya fue visto hoy por este usuario con el método ${metodoIngreso}.`);
          return of(); // No realiza ninguna acción si ya existe
        }
      }),
      catchError((error) => {
        console.error('Error al guardar el animal visto:', error);
        return throwError(() => new Error('Error al guardar el animal visto.'));
      })
    );
  }


  // Método para verificar si el usuario ya ha visto el animal
  usuarioHaVistoAnimal(userId: string, animalId: string): Observable<boolean> {
    const q = query(this._rutaAnimalesVistos, where('userId', '==', userId), where('animalId', '==', animalId));
    return from(getDocs(q)).pipe(map((snapshot) => !snapshot.empty));
  }

  // Método para guardar la planta vista
  guardarPlantaVista(userId: string, plantaId: string, metodoIngreso?: string, area?: string): Observable<void> {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para la fecha actual

    // Consulta para verificar si ya existe un registro del mismo usuario, planta, y método en la fecha actual
    const queryRef = query(
      this._rutaPlantasVistas,
      where('userId', '==', userId),
      where('plantaId', '==', plantaId),
      where('metodoIngreso', '==', metodoIngreso)
    );

    return from(getDocs(queryRef)).pipe(
      switchMap((snapshot) => {
        const existeHoy = snapshot.docs.some((doc) => {
          const data = doc.data() as any;
          const fechaGuardada = new Date(data.vistoEn.toDate()).toISOString().split('T')[0]; // Convertir Firestore Timestamp a fecha
          return fechaGuardada === hoy;
        });

        if (!existeHoy) {
          // Si no existe un registro en la fecha actual, guardar el nuevo registro
          const nuevaPlantaVista = {
            userId,
            plantaId,
            area,
            metodoIngreso,
            vistoEn: new Date(), // Fecha y hora actuales
          };

          return from(addDoc(this._rutaPlantasVistas, nuevaPlantaVista)).pipe(
            map(() => {
              console.log('Planta vista guardada con éxito.');
            })
          );
        } else {
          console.log(`La planta ya fue vista hoy por este usuario con el método ${metodoIngreso}.`);
          return of(); // No realiza ninguna acción si ya existe
        }
      }),
      catchError((error) => {
        console.error('Error al guardar la planta vista:', error);
        return throwError(() => new Error('Error al guardar la planta vista.'));
      })
    );
  }


  // Método para verificar si el usuario ya ha visto la planta
  usuarioHaVistoPlanta(userId: string, plantaId: string): Observable<boolean> {
    const q = query(this._rutaPlantasVistas, where('userId', '==', userId), where('plantaId', '==', plantaId));
    return from(getDocs(q)).pipe(map((snapshot) => !snapshot.empty));
  }

// Método para obtener preguntas de trivia basadas en los animales vistos por el usuario
getPreguntasTriviaPorAnimalesVistos(userId: string): Observable<PreguntaTrivia[]> {
  // Recupera el listado de atracciones vistas desde localStorage
  const atraccionesVistasPreguntas = JSON.parse(localStorage.getItem('atraccionesVistasPreguntas') || '[]');

  // Filtra las atracciones vistas por el usuario y solo obtiene los animales
  const animalesVistos = atraccionesVistasPreguntas.filter((item: any) => item.userId === userId && item.tipo === 'animal');

  // Extrae los IDs de los animales vistos
  const animalIds = animalesVistos.map((item: any) => item.id);

  console.log('IDs de animales vistos:', animalIds); // Para depuración

  // Si hay animales vistos, realizamos la consulta
  if (animalIds.length > 0) {
    const preguntasQuery = query(this._preguntasTrivia, where('animal_id', 'in', animalIds));

    // Ejecuta la consulta y devuelve las preguntas de trivia de animales
    return collectionData(preguntasQuery, { idField: 'id' }) as Observable<PreguntaTrivia[]>;
  } else {
    // Si no hay animales vistos, retorna una lista vacía
    return of([]);
  }
}

  // Método para obtener preguntas de trivia basadas en las plantas vistas por el usuario
  getPreguntasTriviaPorPlantasVistas(userId: string): Observable<PreguntaTrivia[]> {
    // Recupera el listado de atracciones vistas desde localStorage
    const atraccionesVistasPreguntas = JSON.parse(localStorage.getItem('atraccionesVistasPreguntas') || '[]');

    // Filtra las plantas vistas por el usuario
    const plantasVistas = atraccionesVistasPreguntas.filter((item: any) => item.tipo === 'planta' && item.userId === userId);

    // Si hay plantas vistas, obtenemos sus IDs
    const plantaIds = plantasVistas.map((item: any) => item.id);

    if (plantaIds.length > 0) {
      // Si existen plantas vistas, consultamos las preguntas de trivia asociadas con esas plantas
      const preguntasQuery = query(this._preguntasTriviaPlantas, where('planta_id', 'in', plantaIds));
      return collectionData(preguntasQuery, { idField: 'id' }) as Observable<PreguntaTrivia[]>;
    } else {
      // Si no hay plantas vistas, devolvemos una lista vacía
      return of([]);
    }
  }


  // Método para obtener los animales vistos por un usuario
  getAnimalesVistosPorUsuario(userId: string): Observable<any[]> {
    const q = query(this._rutaAnimalesVistos, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' });
  }

  // Método para obtener las plantas vistas por un usuario
  getPlantasVistasPorUsuario(userId: string): Observable<any[]> {
    const q = query(this._rutaPlantasVistas, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' });
  }

  // Método para actualizar los datos de un usuario
  actualizarUsuario(userId: string, data: Partial<Usuario>): Observable<void> {
    const usuariosQuery = query(this._rutaUsuarios, where('auth_id', '==', userId));
    return from(getDocs(usuariosQuery)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.empty) {
          const userDocRef = doc(this._firestore, `Usuarios/${snapshot.docs[0].id}`);
          return from(setDoc(userDocRef, data, { merge: true })); // Utiliza { merge: true }
        } else {
          // Si el documento no existe, crea uno nuevo
          const newUserDocRef = doc(this._rutaUsuarios, userId);
          return from(setDoc(newUserDocRef, data, { merge: true }));
        }
      })
    );
  }

  // Método para guardar las respuestas de trivia
  guardarRespuestaTrivia(respuesta: { resultado: boolean; user_id: string; pregunta_id: string }): Observable<void> {
    return from(addDoc(this._respuestasTrivia, respuesta)).pipe(map(() => { }));
  }

  // Método para guardar las respuestas de trivia
  guardarRespuestaTrivia2(respuesta: { resultado: boolean; user_id: string; pregunta_id: string; fecha: Date, genero_usuario: string, tipo: string }): Observable<void> {
    return from(addDoc(this._respuestasTrivia, respuesta)).pipe(map(() => { }));
  }


  //Ranking 5 usuarios con mas nivel
  getTopUsuarios(): Observable<Usuario[]> {
    const topUsuariosQuery = query(
      this._rutaUsuarios,
      orderBy('nivel', 'desc'),
      limit(5)
    );

    return collectionData(topUsuariosQuery, { idField: 'id' }) as Observable<Usuario[]>;
  }

  getPlantas(): Observable<Planta[]> {
    return collectionData(this._rutaPlantas, { idField: 'id' }) as Observable<Planta[]>;
  }

  // Método para obtener un animal por ID
  getPlanta(id: string): Observable<Planta | null> {
    const docRef = doc(this._rutaPlantas, id);
    return from(getDoc(docRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } as Planta : null))
    );
  }

  obtenerPremiosUsuario(usuarioId: string): Observable<PremioUsuario[]> {
    const premiosQuery = query(this._rutaPremiosUsuarios, where('usuarioId', '==', usuarioId));
    return collectionData(premiosQuery, { idField: 'id' }) as Observable<PremioUsuario[]>;
  }

  // Método para obtener la información de un premio específico
  obtenerPremioPorId(premioId: string): Observable<Premio> {
    const premioDocRef = doc(this._firestore, `Premios_trivia/${premioId}`);
    return from(getDoc(premioDocRef)).pipe(
      map((doc) => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as unknown as Premio; // Agregamos manualmente el 'id'
        } else {
          throw new Error('Premio no encontrado');
        }
      })
    );
  }

  getPremios(): Observable<Premio[]> {
    return collectionData(this._rutaPremiosTrivia, { idField: 'id' }) as Observable<Premio[]>;
  }

  // Método para obtener un animal por ID
  getAnimalById(id: string): Observable<Animal | null> {
    const docRef = doc(this._firestore, `${PATH_ANIMALES}/${id}`);
    return from(getDoc(docRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } as Animal : null))
    );
  }

  // Método para obtener una planta por ID
  getPlantaById(id: string): Observable<Planta | null> {
    const docRef = doc(this._firestore, `${PATH_PLANTAS}/${id}`);
    return from(getDoc(docRef)).pipe(
      map((doc) => (doc.exists() ? { id: doc.id, ...doc.data() } as Planta : null))
    );
  }

  // Métodos para Like y Dislike de Plantas usando la nueva ruta
  getUserReactionPlanta(plantaId: string, userId: string): Observable<Reaction | null> {
    const reactionsQuery = query(
      this._rutaReaccionesPlantas,
      where('plantaId', '==', plantaId),
      where('userId', '==', userId)
    );
    return from(getDocs(reactionsQuery)).pipe(
      map((snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as Reaction;
          return { id: snapshot.docs[0].id, ...data } as Reaction;
        }
        return null;
      })
    );
  }

  addReactionPlanta(reaction: ReactionPlanta): Observable<DocumentReference> {
    return from(addDoc(this._rutaReaccionesPlantas, reaction));
  }



  updateReactionPlanta(id: string, reaction: Partial<Reaction>): Observable<void> {
    const docRef = doc(this._rutaReaccionesPlantas, id);
    return from(setDoc(docRef, reaction, { merge: true }));
  }


  // Método para obtener los animales con paginación
  getPaginatedAnimals(itemsPerPage: number, lastDoc?: QueryDocumentSnapshot<Animal>): Observable<Animal[]> {
    let animalQuery;

    if (lastDoc) {
      animalQuery = query(this._rutaAnimal, orderBy('nombre_comun'), startAfter(lastDoc), limit(itemsPerPage));
    } else {
      animalQuery = query(this._rutaAnimal, orderBy('nombre_comun'), limit(itemsPerPage));
    }

    return from(getDocs(animalQuery)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal)))
    );
  }

  // Método para obtener las plantas con paginación
  getPaginatedPlants(itemsPerPage: number, lastDoc?: QueryDocumentSnapshot<Planta>): Observable<Planta[]> {
    let plantQuery;

    if (lastDoc) {
      plantQuery = query(this._rutaPlantas, orderBy('nombre_comun'), startAfter(lastDoc), limit(itemsPerPage));
    } else {
      plantQuery = query(this._rutaPlantas, orderBy('nombre_comun'), limit(itemsPerPage));
    }

    return from(getDocs(plantQuery)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Planta)))
    );
  }



}
