import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-menu-administracion',
  standalone: false,
  templateUrl: './pg-menu-administracion.component.html',
  styleUrl: './pg-menu-administracion.component.css'
})
export class PgMenuAdministracionComponent {
  menuItems = [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/admin/inicio' },
    { label: 'Administración Seguridad', icon: 'pi pi-lock', routerLink: '/admin/accesos' },
    { label: 'Redes', icon: 'pi pi-sitemap', routerLink: '/admin/redes' },
    { label: 'Análisis', icon: 'pi pi-chart-line', routerLink: '/admin/analisis' },
    { label: 'Reportes', icon: 'pi pi-file', routerLink: '/admin/reportes' },
    { label: 'Configuración', icon: 'pi pi-cog', routerLink: '/admin/configuracion' },
  ];
}
