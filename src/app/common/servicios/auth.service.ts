import { Injectable,inject } from '@angular/core';
import {Auth,authState,signOut,signInWithEmailAndPassword, getAuth,createUserWithEmailAndPassword } from '@angular/fire/auth'
import { from, map, Observable } from 'rxjs';
import { addDoc, collectionData, doc, DocumentReference, Firestore, getDoc, getDocs, query, setDoc, where,collection, deleteDoc } from '@angular/fire/firestore';
import {CrearUsuario, Usuario} from '../models/usuario.model'
import {Boleta, BoletaUsada, CrearBoletaUsada} from '../models/boleta.model'



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

  constructor() { }


  private _auth = inject(Auth);
  private _firestore=inject(Firestore)
  private _rutaUsuarios = collection(this._firestore, PATH_USUARIOS)
  private _rutaBoletas = collection(this._firestore, PATH_BOLETAS)
  private _rutaBoletasUsadas = collection(this._firestore, PATH_BOLETAS_USADAS)




  get authState$():Observable<any> {
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



  logOut(){
    return signOut(this._auth);
  }



  logearse(user:User){
    return  signInWithEmailAndPassword(this._auth,user.email,user.password)
  }




  async registrarse(email: string, password: string, nombre: string, telefono: string, genero: string, patente:string,fechaNacimiento:Date) {
    try {
      // Intentar crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this._auth, email, password);
      const user = userCredential.user;

      // Crear el documento para el usuario en Firestore
      const nuevo_usuario: CrearUsuario = {
        nombre: nombre,
        correo:email,
        telefono: telefono,
        genero: genero,
        puntos: 0,
        nivel: 0,
        patente:patente,
        fechaNacimiento:fechaNacimiento,
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

}



