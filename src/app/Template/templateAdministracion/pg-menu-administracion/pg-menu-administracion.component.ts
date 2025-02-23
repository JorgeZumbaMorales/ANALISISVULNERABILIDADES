import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pg-menu-administracion',
  standalone: false,
  templateUrl: './pg-menu-administracion.component.html',
  styleUrls: ['./pg-menu-administracion.component.css']
})
export class PgMenuAdministracionComponent {
  menuItems = [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/admin/inicio' },
    { label: 'Administración', icon: 'pi pi-users', routerLink: '/admin/accesos' },
    { label: 'Dispositivos', icon: 'pi pi-tablet', routerLink: '/admin/dispositivos' },
    { label: 'Vulnerabilidades', icon: 'pi pi-shield', routerLink: '/admin/vulnerabilidades' },
    { label: 'Reportes', icon: 'pi pi-chart-line', routerLink: '/admin/reportes' },
    { label: 'Configuraciones', icon: 'pi pi-cog', routerLink: '/admin/configuraciones' }
  ];
  
  activeMenu: string = this.menuItems[0].routerLink;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.url.subscribe(() => {
      this.activeMenu = this.router.url;
    });
  }

  setActiveMenu(route: string) {
    this.activeMenu = route;
  }
}
