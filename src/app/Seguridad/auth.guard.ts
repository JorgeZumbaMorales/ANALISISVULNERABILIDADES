import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SesionUsuarioService } from './sesion-usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private sesionService: SesionUsuarioService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si el usuario está autenticado
    if (this.sesionService.estaAutenticado()) {
      return true; // ✅ Permitir acceso a la ruta
    } else {
      // ❌ Redirigir al login si no está autenticado
      this.router.navigate(['/public/login']);
      return false;
    }
  }
}
