export interface Usuario {
  id: string;
  nombre:string,
  correo:string,
  telefono:string,
  genero:string,
  puntos:number,
  nivel:number,
  patente?:string,
  auth_id:string,
}


export type CrearUsuario = Omit<Usuario, 'id'>
