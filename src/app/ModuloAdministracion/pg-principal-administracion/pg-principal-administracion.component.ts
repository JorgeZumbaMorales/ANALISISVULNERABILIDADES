import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
    selector: 'app-pg-principal-administracion',
    templateUrl: './pg-principal-administracion.component.html',
    styleUrl: './pg-principal-administracion.component.css',
    imports: [RouterLink, NgClass, RouterOutlet]
})
export class PgPrincipalAdministracionComponent {
  tabs = [
    { label: 'Usuarios', route: '/admin/accesos/usuarios', icon: 'pi pi-users' },
    { label: 'Roles', route: '/admin/accesos/roles', icon: 'pi pi-key' }
  ];
  
  activeTab: string = this.tabs[0].route; 

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.url.subscribe(() => {
      const currentRoute = this.router.url;
      this.activeTab = this.tabs.find(tab => currentRoute.includes(tab.route))?.route || this.tabs[0].route;
    });
  }

  setActiveTab(route: string) {
    this.activeTab = route;
  }
}
