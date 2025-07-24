import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ServiciosAutenticacion } from '../../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';
import { PgHeaderAdministracionComponent } from '../pg-header-administracion/pg-header-administracion.component';
import { PgMenuAdministracionComponent } from '../pg-menu-administracion/pg-menu-administracion.component';
import { PgFooterAdministracionComponent } from '../pg-footer-administracion/pg-footer-administracion.component';

@Component({
  standalone: true,
    selector: 'app-pg-dashboard-administracion',
    templateUrl: './pg-dashboard-administracion.component.html',
    styleUrl: './pg-dashboard-administracion.component.css',
    imports: [PgHeaderAdministracionComponent, PgMenuAdministracionComponent, RouterOutlet, PgFooterAdministracionComponent]
})
export class PgDashboardAdministracionComponent implements OnInit {
  rolSeleccionado: string = '';

  constructor(
    private router: Router,
    private serviciosAutenticacion: ServiciosAutenticacion,
    private sesionService: SesionUsuarioService
  ) {}

  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil && perfil.roles.length > 0) {
      this.rolSeleccionado = perfil.roles[0]; // ✅ Obtener rol por defecto
      this.sesionService.setRolActivo(this.rolSeleccionado); // ✅ Emitirlo desde el inicio
    }
  }

  actualizarMenuPorRol(nuevoRol: string) {
    this.rolSeleccionado = nuevoRol;
    this.sesionService.setRolActivo(nuevoRol); // ✅ Emitir cada cambio manual
    this.serviciosAutenticacion.obtenerMenuPorRol(nuevoRol).subscribe({
      next: (secciones) => {
        if (secciones && secciones.length > 0) {
          this.router.navigate([secciones[0].ruta]);
        }
      },
      error: (error) => {
        console.error('Error al obtener el menú por rol:', error);
      }
    });
  }
}
