import { Component } from '@angular/core';
import { PgLoginComponent } from '../pg-login/pg-login.component';

@Component({
    standalone: true,
    selector: 'app-pg-login-publico',
    templateUrl: './pg-login-publico.component.html',
    styleUrl: './pg-login-publico.component.css',
    imports: [PgLoginComponent]
})
export class PgLoginPublicoComponent {

}
