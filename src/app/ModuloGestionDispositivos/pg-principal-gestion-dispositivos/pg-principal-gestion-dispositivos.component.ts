import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pg-principal-gestion-dispositivos',
  templateUrl: './pg-principal-gestion-dispositivos.component.html',
  styleUrls: ['./pg-principal-gestion-dispositivos.component.css']
})
export class PgPrincipalGestionDispositivosComponent implements OnInit {
  tabs = [
    { label: 'Dispositivos Activos', route: '/admin/gestion/dispositivos', icon: 'pi pi-server' },
    { label: 'Historial Dispositivos', route: '/admin/gestion/historial', icon: 'pi pi-clock' }
  ];

  activeTab: string = '';
  mostrarContenido: boolean = true; // ✅ Clave para forzar destrucción del hijo

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.establecerTabActivo(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.establecerTabActivo(event.urlAfterRedirects);

        // 👇 Forzar recarga del router-outlet
        this.mostrarContenido = false;
        setTimeout(() => this.mostrarContenido = true, 0);
      });
  }

  establecerTabActivo(ruta: string): void {
    this.activeTab =
      this.tabs.find(tab => ruta === tab.route)?.route ||
      this.tabs.find(tab => ruta.startsWith(tab.route + '/'))?.route || 
      '';
  }
}
