import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgFor, NgClass } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-pg-principal-vulnerabilidades',
  templateUrl: './pg-principal-vulnerabilidades.component.html',
  styleUrls: ['./pg-principal-vulnerabilidades.component.css'],
  imports: [NgFor, RouterLink, NgClass, RouterOutlet]
})
export class PgPrincipalVulnerabilidadesComponent implements OnInit {
  tabs = [
    { label: 'Puertos Vulnerables', route: 'dispositivos-vulnerables', icon: 'pi pi-desktop' },
    { label: 'Vulnerabilidades', route: 'cve', icon: 'pi pi-lock' }
  ];

  activeTab: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.actualizarTabActivo(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.actualizarTabActivo(event.urlAfterRedirects);
      });
  }

  private actualizarTabActivo(ruta: string): void {
    this.activeTab =
      this.tabs.find(tab => ruta.endsWith(tab.route))?.route ||
      this.tabs.find(tab => ruta.includes(tab.route))?.route || '';
  }

  trackByFn(index: number, item: any) {
    return item.route;
  }
}
