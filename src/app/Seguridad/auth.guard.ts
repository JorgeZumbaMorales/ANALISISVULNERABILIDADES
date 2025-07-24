import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SesionUsuarioService } from './sesion-usuario.service';
import { ServiciosAutenticacion } from '../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private sesionService: SesionUsuarioService,
    private authService: ServiciosAutenticacion,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (!this.sesionService.estaAutenticado()) {
      this.router.navigate(['/public/login']);
      return of(false);
    }
    return this.authService.obtenerMiPerfil().pipe(
      map((perfil) => {
        this.sesionService.guardarPerfil(perfil);
        return true;
      }),
      catchError(() => {
        this.sesionService.cerrarSesion();
        this.router.navigate(['/public/login']);
        return of(false);
      })
    );
  }


}
