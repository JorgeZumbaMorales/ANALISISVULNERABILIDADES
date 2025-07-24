import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  standalone: true,
    selector: 'app-pg-header-publico',
    templateUrl: './pg-header-publico.component.html',
    styleUrl: './pg-header-publico.component.css',
    imports: [Button]
})
export class PgHeaderPublicoComponent {
  constructor(private router: Router) {}
  navigateToLogin() {
     console.log('Redirigiendo a login...');
    this.router.navigate(['/public/login']);
  }
  onFormularioClick(): void {
  window.open('https://forms.gle/XbKSWnkgpydxY9Q28', '_blank');
}


}
