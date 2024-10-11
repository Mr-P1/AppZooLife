import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage = getStorage();

  constructor(private firebaseApp: FirebaseApp) {}

  // Ajuste para devolver una promesa que resuelve con la URL de descarga
  uploadFile(event: any): Promise<string> {
    const file = event.target.files[0];
    const filePath = `animales/${file.name}`;
    const storageRef = ref(this.storage, filePath);

    return uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded a blob or file!');
      return getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        return downloadURL;  // Devuelve la URL de descarga
      });
    }).catch((error) => {
      console.error("Error uploading file:", error);
      throw error;  // Propaga el error para manejarlo en el componente
    });
  }

  // Método para obtener la URL de una imagen existente en Firebase Storage / esto es para probar que traiga la imagen no más
  getImageUrl(imagePath: string): Promise<string> {
    const storageRef = ref(this.storage, imagePath);

    // Obtener la URL de descarga del archivo
    return getDownloadURL(storageRef);
  }
}
