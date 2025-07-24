import { Component } from '@angular/core';
import { PgHeaderPublicoComponent } from '../templatePublico/pg-header-publico/pg-header-publico.component';
import { PgDashboardPublicoComponent } from '../templatePublico/pg-dashboard-publico/pg-dashboard-publico.component';
import { PgPortadaInicialComponent } from '../templatePublico/pg-portada-inicial/pg-portada-inicial.component';
import { PgFooterPublicoComponent } from '../templatePublico/pg-footer-publico/pg-footer-publico.component';

@Component({
    standalone: true,
    selector: 'app-pg-inicio-portada',
    templateUrl: './pg-inicio-portada.component.html',
    styleUrl: './pg-inicio-portada.component.css',
    imports: [PgHeaderPublicoComponent, PgDashboardPublicoComponent, PgPortadaInicialComponent, PgFooterPublicoComponent]
})
export class PgInicioPortadaComponent {

}
