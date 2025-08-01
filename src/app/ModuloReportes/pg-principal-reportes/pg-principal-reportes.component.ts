import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
    selector: 'app-pg-principal-reportes',
    templateUrl: './pg-principal-reportes.component.html',
    styleUrls: ['./pg-principal-reportes.component.css'],
    imports: [RouterLink, NgClass, RouterOutlet]
})
export class PgPrincipalReportesComponent {
  tabs = [
    { label: 'Dashboard', route: 'dashboard-visual', icon: 'pi pi-chart-bar' },
    { label: 'Documentos', route: 'documentos', icon: 'pi pi-file-pdf' }
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
