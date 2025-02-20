import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pg-header-publico',
  standalone: false,
  templateUrl: './pg-header-publico.component.html',
  styleUrl: './pg-header-publico.component.css'
})
export class PgHeaderPublicoComponent {
  constructor(private router: Router) {}
  navigateToLogin() {
    this.router.navigate(['/public/login']);
  }
}
