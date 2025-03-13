import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pg-principal-gestion-dispositivos',
  templateUrl: './pg-principal-gestion-dispositivos.component.html',
  styleUrl: './pg-principal-gestion-dispositivos.component.css'
})
export class PgPrincipalGestionDispositivosComponent {
  tabs = [
    { label: 'Dispositivos', route: '/admin/gestion/dispositivos', icon: 'pi pi-server' },
    { label: 'Historial', route: '/admin/gestion/historial', icon: 'pi pi-clock' }  // ✅ Nueva pestaña
];

  
  activeTab: string = this.tabs[0].route;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url;
        this.activeTab = this.tabs.find(tab => currentRoute.includes(tab.route))?.route || this.tabs[0].route;
      });
  }
}
