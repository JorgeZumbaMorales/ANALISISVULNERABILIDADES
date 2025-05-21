import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosAutenticacion } from '../../../ModuloServiciosWeb/ServiciosAutenticacion.component';

@Component({
  selector: 'app-pg-dashboard-administracion',
  templateUrl: './pg-dashboard-administracion.component.html',
  styleUrl: './pg-dashboard-administracion.component.css'
})
export class PgDashboardAdministracionComponent {
  rolSeleccionado: string = '';

  constructor(
    private router: Router,
    private serviciosAutenticacion: ServiciosAutenticacion
  ) {}

  actualizarMenuPorRol(nuevoRol: string) {
    this.rolSeleccionado = nuevoRol;

    // 🔄 Consultar el nuevo menú desde el backend
    this.serviciosAutenticacion.obtenerMenuPorRol(nuevoRol).subscribe({
      next: (secciones) => {
        if (secciones && secciones.length > 0) {
          // ✅ Redirigir automáticamente a la primera sección permitida
          this.router.navigate([secciones[0].ruta]);
        }
      },
      error: (error) => {
        console.error('Error al obtener el menú por rol:', error);
      }
    });
  }
}
