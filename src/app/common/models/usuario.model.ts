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
  token?:string
  fechaRegistro: Date
}


export type CrearUsuario = Omit<Usuario, 'id'>
