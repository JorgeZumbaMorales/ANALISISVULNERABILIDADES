import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ServiciosAutenticacion {
  private apiUrlAuth = `${environment.apiUrl}/auth`; 
  private apiUrlRecuperacion = `${environment.apiUrl}/recuperacion`; 
  private apiUrlUsuarios = `${environment.apiUrl}/usuarios`; 
  private apiUrlRoles = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // ===================== INICIAR SESIÓN =====================

  iniciarSesion(credenciales: any): Observable<any> {
    console.log("CREDENCIALES",credenciales);
    return this.http.post<any>(`${this.apiUrlAuth}/login`, credenciales)
        .pipe(catchError(this.handleError));
  }
  obtenerMenuPorUsuario(): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${environment.apiUrl}/secciones/menu`, { headers })
    .pipe(catchError(this.handleError));
}
obtenerMenuPorRol(nombreRol: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  // Si tienes un mapa para convertir nombre a rol_id, úsalo. Si no, ajusta según tu backend.
  const rolIdMap: any = {
    Administrador: 1,
    Analista: 2,
    Usuario: 3
  };
  const rolId = rolIdMap[nombreRol];

  return this.http.get<any>(`${environment.apiUrl}/secciones/menu_por_rol/${rolId}`, { headers })
    .pipe(catchError(this.handleError));
}

  obtenerMiPerfil(): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${this.apiUrlUsuarios}/mi_perfil`, { headers })
    .pipe(catchError(this.handleError));
}

  // ===================== USUARIOS =====================

  listarUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlUsuarios}/listar_usuarios`)
      .pipe(catchError(this.handleError));
  }

  
  crearUsuario(usuario: any, rolId: number): Observable<any> {
    console.log("SERVICIO USUARIO",usuario);
    console.log("SERVICIO ROL ID", rolId);
    const params = new HttpParams().set('rol_id', rolId.toString());

    return this.http.post<any>(
      `${this.apiUrlUsuarios}/crear_usuario`, 
      usuario, 
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        params: params 
      }
    ).pipe(catchError(this.handleError));
  }

  actualizarUsuario(usuarioId: number, usuario: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlUsuarios}/actualizar_usuario/${usuarioId}`, 
      usuario
    ).pipe(catchError(this.handleError));
  }

  actualizarEstadoUsuario(usuarioId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlUsuarios}/actualizar_estado_usuario/${usuarioId}`, 
      { estado }
    ).pipe(catchError(this.handleError));
  }

  eliminarUsuario(usuarioId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlUsuarios}/eliminar_usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }

  buscarUsuarioPorNombre(nombreUsuario: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlUsuarios}/buscar_por_nombre/${nombreUsuario}`)
      .pipe(catchError(this.handleError));
  }

  buscarUsuarioPorCorreo(correo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlUsuarios}/buscar_por_correo/${correo}`)
      .pipe(catchError(this.handleError));
  }
  
  actualizarContrasena(datos: { usuario_id: number, nueva_contrasena: string }): Observable<any> {
    console.log("DATOS",datos);
    return this.http.put<any>(`${this.apiUrlUsuarios}/actualizar_contrasena`, datos)
      .pipe(catchError(this.handleError));
  }

  solicitarRecuperacion(datos: { usuario?: string; correo?: string }): Observable<any> {
    console.log("DATOS",datos);
    return this.http.post<any>(
        `${this.apiUrlRecuperacion}/solicitar`, 
        datos, 
        {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }
    ).pipe(catchError(this.handleError));
  } 
  verificarCodigo(codigo: string, usuario: string): Observable<any> {
    return this.http.post<any>(
        `${this.apiUrlRecuperacion}/validar_codigo`,
        { usuario, codigo }
    ).pipe(catchError(this.handleError));
  }
  // ===================== ROLES =====================

  listarRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlRoles}/listar_roles`)
      .pipe(catchError(this.handleError));
  }

  crearRol(rol: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRoles}/crear_rol`, 
      rol, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  actualizarRol(rolId: number, rol: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlRoles}/actualizar_rol/${rolId}`, 
      rol
    ).pipe(catchError(this.handleError));
  }

  actualizarEstadoRol(rolId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlRoles}/actualizar_estado_rol/${rolId}`, 
      { estado }
    ).pipe(catchError(this.handleError));
  }

  eliminarRol(rolId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlRoles}/eliminar_rol/${rolId}`)
      .pipe(catchError(this.handleError));
  }

  listarTodasLasSecciones(): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${environment.apiUrl}/secciones/listar_secciones`, { headers })
    .pipe(catchError(this.handleError));
}


  // ===================== MANEJO DE ERRORES =====================
  private handleError(error: any): Observable<never> {
    console.error('Error en la petición:', error);

    let mensajeError = 'Ocurrió un error inesperado';

    if (error.error && error.error.detail) {
        mensajeError = error.error.detail; // Capturar mensaje del backend
    } else if (error.error && typeof error.error === 'string') {
        mensajeError = error.error; // Para errores en texto plano
    }

    // ✅ Limpiar mensaje eliminando códigos de error innecesarios
    mensajeError = mensajeError.replace(/.*:\s\d{3}:\s/, ''); // Borra "Error en la base de datos: 400: "

    return throwError(() => new Error(mensajeError));
  }


}
