import { Component, OnInit } from '@angular/core';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';

@Component({
  selector: 'app-vulnerabilidades-cve',
  templateUrl: './vulnerabilidades-cve.component.html',
  styleUrls: ['./vulnerabilidades-cve.component.css']
})
export class VulnerabilidadesCveComponent implements OnInit {
  dispositivos: any[] = [];
  dispositivoSeleccionado: any = null;
  cargando: boolean = true;

  constructor(private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades) {}

  ngOnInit(): void {
    this.obtenerVulnerabilidades();
  }

  obtenerVulnerabilidades(): void {
    this.vulnerabilidadServicio.obtenerVulnerabilidadesCompletas().subscribe({
      next: (resp) => {
        this.dispositivos = resp.data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener vulnerabilidades:', err);
        this.cargando = false;
      }
    });
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }
}
