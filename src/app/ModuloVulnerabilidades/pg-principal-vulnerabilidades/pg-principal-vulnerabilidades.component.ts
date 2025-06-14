import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pg-principal-vulnerabilidades',
  templateUrl: './pg-principal-vulnerabilidades.component.html',
  styleUrls: ['./pg-principal-vulnerabilidades.component.css']
})
export class PgPrincipalVulnerabilidadesComponent {
  
  // ✅ Definir los Tabs para la navegación
  tabs = [
    { label: 'Puertos Vulnerables', route: 'dispositivos-vulnerables', icon: 'pi pi-desktop' },
    { label: 'Vulnerabilidades', route: 'cve', icon: 'pi pi-lock' }
  ];
  

  activeTab: string = this.tabs[0].route; 

  constructor(private route: ActivatedRoute, private router: Router) {
    // ✅ Detectar el tab activo basado en la URL
    this.route.url.subscribe(() => {
      const currentRoute = this.router.url;
      this.activeTab = this.tabs.find(tab => currentRoute.includes(tab.route))?.route || this.tabs[0].route;
    });
  }

  // ✅ Método para cambiar el tab activo
  setActiveTab(route: string) {
    this.activeTab = route;
  }

  // ✅ Método para mejorar la performance en el *ngFor
  trackByFn(index: number, item: any) {
    return item.route;
  }
}
