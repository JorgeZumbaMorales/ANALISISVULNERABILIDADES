import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgFor, NgClass } from '@angular/common';

@Component({
  standalone: true,
    selector: 'app-pg-principal-configuracion',
    templateUrl: './pg-principal-configuracion.component.html',
    styleUrls: ['./pg-principal-configuracion.component.css'],
    imports: [NgFor, RouterLink, NgClass, RouterOutlet]
})
export class PgPrincipalConfiguracionComponent {
  
 
  tabs = [
    { label: 'Escaneos', route: 'escaneos', icon: 'pi pi-cog' }
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


  trackByFn(index: number, item: any) {
    return item.route;
  }
}
