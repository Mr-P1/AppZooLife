import { Injectable, inject } from '@angular/core';
import { Auth, authState, signOut, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword, getIdToken } from '@angular/fire/auth'
import { from, map, Observable } from 'rxjs';
import { addDoc, collectionData, doc, DocumentReference, Firestore, getDoc, getDocs, query, setDoc, where, collection, deleteDoc } from '@angular/fire/firestore';
import { CrearUsuario, Usuario } from '../models/usuario.model'
import { Boleta, BoletaUsada, CrearBoletaUsada } from '../models/boleta.model'
import { registerVersion } from '@angular/fire/app';
import { FirestoreService } from './firestore.service';
import {NotificacionesService} from './notificaciones.service'



const PATH_USUARIOS = 'Usuarios';
const PATH_BOLETAS = 'Boletas';
const PATH_BOLETAS_USADAS = 'Boletas_usadas';



export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private FirestoreService: FirestoreService,
    private notificacionesService: NotificacionesService
  ) { }


  private _auth = inject(Auth);
  private _firestore = inject(Firestore)
  private _rutaUsuarios = collection(this._firestore, PATH_USUARIOS)
  private _rutaBoletas = collection(this._firestore, PATH_BOLETAS)
  private _rutaBoletasUsadas = collection(this._firestore, PATH_BOLETAS_USADAS)




  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  get currentUserId(): string | null {
    const user = this._auth.currentUser;
    return user ? user.uid : null;
  }

  get currentUserEmail(): string | null {
    const user = this._auth.currentUser;
    return user ? user.email : null;
  }



  // Obtener los datos completos del usuario, combinando la autenticación y Firestore
  async getUsuarioFirestore(authId: string): Promise<Usuario | null> {
    // Hacer una consulta en la colección `Usuarios` para obtener el usuario que coincida con el auth_id
    const q = query(this._rutaUsuarios, where('auth_id', '==', authId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Retornar el primer documento que coincida con el auth_id
      const usuario = querySnapshot.docs[0].data() as Usuario;
      return usuario;
    } else {
      return null;  // Si no se encuentra el usuario, retorna null
    }
  }



  async logOut(): Promise<void> {
    await signOut(this._auth);
    sessionStorage.removeItem('authToken'); // Remover el token de sessionStorage
  }


  async logearse(user: User): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(this._auth, user.email, user.password);

    // Obtiene el token del usuario
    const token = await getIdToken(userCredential.user); //Quitar
    const fcmToken = this.notificacionesService.getToken();

    // Guarda el token en sessionStorage //Quitar
    sessionStorage.setItem('authToken', token);

    // Limpia la variable `animalesVistosSesion` en localStorage al iniciar sesión
    localStorage.removeItem('animalesVistosSesion');

    // Actualiza el token en el documento de Firestore del usuario
    await this.FirestoreService.actualizarUsuario(userCredential.user.uid, { token: fcmToken! }).toPromise();
  }

  // Método para obtener el token de sessionStorage si ya está guardado
  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }




  async registrarse(email: string, password: string, nombre: string, telefono: string, genero: string, patente: string, fechaNacimiento: Date, region: string, comuna: string) {
    try {
      // Intentar crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this._auth, email, password);
      const user = userCredential.user;

      // Crear el documento para el usuario en Firestore
      const nuevo_usuario: CrearUsuario = {
        nombre: nombre,
        correo: email,
        telefono: telefono,
        genero: genero,
        puntos: 0,
        nivel: 0,
        patente: patente,
        fechaNacimiento: fechaNacimiento,
        region: region,
        comuna: comuna,
        auth_id: user.uid,
      };

      await addDoc(this._rutaUsuarios, nuevo_usuario);

      //No hace que inicie la sesion
      await signOut(this._auth);


    } catch (error: any) {
      // Verificar si el error es porque el correo ya está en uso
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este correo electrónico ya está en uso.');
      } else {
        throw new Error('El correo ya esta en uso');
      }
    }
  }


  // Método para obtener una boleta por ID
  async getBoleta(boletaId: string): Promise<Boleta | null> {
    const boletaDocRef = doc(this._firestore, `Boletas/${boletaId}`);
    const boletaSnapshot = await getDoc(boletaDocRef);
    if (boletaSnapshot.exists()) {
      return boletaSnapshot.data() as Boleta;
    } else {
      return null;
    }
  }

  // Método para mover una boleta a la colección Boletas_usadas
  async usarBoleta(boletaId: string, userId: string): Promise<void> {
    const boletaDocRef = doc(this._firestore, `Boletas/${boletaId}`);
    const boletaData = await getDoc(boletaDocRef);

    if (boletaData.exists()) {
      const boleta = boletaData.data() as Boleta;
      const fechaUso = new Date();
      const boletaUsada: CrearBoletaUsada = {
        tipo: boleta.tipo,
        fecha: fechaUso,
        id_usuario: userId
      };

      // Mover la boleta a Boletas_usadas
      const usadaDocRef = doc(this._firestore, `Boletas_usadas/${boletaId}`);
      await setDoc(usadaDocRef, boletaUsada);

      // Eliminar la boleta de Boletas
      await deleteDoc(boletaDocRef);
    }
  }



  async logearse2(user: User): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(this._auth, user.email, user.password);

    // Limpia la variable `animalesVistosSesion` en localStorage al iniciar sesión
    localStorage.removeItem('animalesVistosSesion');

    // Obtiene el token FCM para las notificaciones
    let fcmToken = this.notificacionesService.getToken();

    // Verifica si el token FCM está disponible; si no, intenta inicializar las notificaciones nuevamente
    if (!fcmToken) {
        const permisoConcedido = await this.notificacionesService.initPush(); // Vuelve a pedir permiso si no hay token
        if (permisoConcedido) {
            fcmToken = this.notificacionesService.getToken(); // Intenta obtener el token después de initPush
        }
    }

    // Si el token FCM aún no está disponible, muestra un mensaje de advertencia
    if (!fcmToken) {
        console.warn('No se pudo obtener el token FCM. Asegúrate de que el dispositivo esté registrado para notificaciones.');
        return; // Detén el proceso si no tienes el token FCM
    }

    // Actualiza el token FCM en el documento de Firestore del usuario
    await this.FirestoreService.actualizarUsuario(userCredential.user.uid, { token:fcmToken }).toPromise();
    console.log('Token FCM guardado para el usuario:', userCredential.user.uid);
}



}



