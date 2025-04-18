import { Component, OnInit } from '@angular/core';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-vulnerabilidades-cve',
  templateUrl: './vulnerabilidades-cve.component.html',
  styleUrls: ['./vulnerabilidades-cve.component.css'],
  providers: [MessageService]
})
export class VulnerabilidadesCveComponent implements OnInit {
  dispositivos: any[] = [];
  dispositivoSeleccionado: any = null;
  resumenCves: any[] = [];
  cargando: boolean = false;
  mostrarResumen: boolean = false;
  mostrarDetalle: boolean = false;

  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data || [];
        console.log('Dispositivos cargados:', this.dispositivos);
      },
      error: (err) => {
        console.error('❌ Error al obtener dispositivos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los dispositivos'
        });
      }
    });
  }

  escanearDispositivo(): void {
    if (!this.dispositivoSeleccionado) return;

    this.cargando = true;
    this.mostrarResumen = false;
    this.mostrarDetalle = false;

    const payload = {
      dispositivo_id: this.dispositivoSeleccionado.dispositivo_id,
      mac_address: this.dispositivoSeleccionado.mac_address,
      ip_actual: this.dispositivoSeleccionado.ultima_ip
    };

    this.vulnerabilidadServicio.ejecutarEscaneoAvanzado(payload).subscribe({
      next: (resp) => {
        this.resumenCves = resp.resumen_cves;
        this.mostrarResumen = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Escaneo exitoso',
          detail: 'El resumen ha sido generado.'
        });
      },
      error: (err) => {
        console.error('❌ Error al escanear:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al escanear el dispositivo.'
        });
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  verDetalle(): void {
    this.mostrarDetalle = true;
    this.mostrarResumen = false;
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }
}
