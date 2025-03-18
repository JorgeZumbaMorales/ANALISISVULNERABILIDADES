import { Component, OnInit } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';

interface Puerto {
  puerto_id: number;
  numero: number;
  servicio?: string;
}

interface Dispositivo {
  macAddress: string;
  riesgo: string;
  tipo?: string;
  fabricante?: string;
  puertosAbiertos: Puerto[];
  puertosSeleccionados: Puerto[];
  cargandoRecomendaciones?: boolean; // 🔹 Nueva propiedad para el spinner
}

@Component({
  selector: 'app-pg-dispositivos-vulnerables',
  templateUrl: './pg-dispositivos-vulnerables.component.html',
  styleUrls: ['./pg-dispositivos-vulnerables.component.css']
})
export class PgDispositivosVulnerablesComponent implements OnInit {

  dispositivos: { [clave: string]: Dispositivo[] } = {
    "Alto": [],
    "Medio": [],
    "Bajo": []
  };

  listaRecomendaciones: any[] = [];
  dialogoVisible = false;

  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private servicioAnalisisVulnerabilidades: ServiciosAnalisisVulnerabilidades
  ) {}

  ngOnInit() {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    ['Alto', 'Medio', 'Bajo'].forEach(nivel => {
      this.servicioDispositivos.obtenerDispositivosRiesgo(nivel).subscribe(respuesta => {
        this.dispositivos[nivel] = respuesta.data.dispositivos.map((dispositivo: any) => ({
          macAddress: dispositivo.mac_address,
          riesgo: dispositivo.riesgo,
          tipo: dispositivo.tipo || "Desconocido",
          fabricante: dispositivo.fabricante || "No disponible",
          puertosAbiertos: dispositivo.puertos_abiertos.map((puerto: any) => ({
            puerto_id: puerto.puerto_id,
            numero: puerto.numero,
            servicio: puerto.servicio || "Desconocido"
          })) || [],
          puertosSeleccionados: [],
          cargandoRecomendaciones: false // 🔹 Inicializamos en false
        }));
      });
    });
  }

  obtenerDispositivos(riesgo: string): Dispositivo[] {
    return this.dispositivos[riesgo] || [];
  }

  obtenerColorEtiqueta(riesgo: string): "info" | "warn" | "danger" | "secondary" | undefined {
    switch (riesgo) {
      case 'Alto': return 'danger';
      case 'Medio': return 'warn';
      case 'Bajo': return 'info';
      default: return 'secondary';
    }
  }

  mostrarRecomendaciones(dispositivo: Dispositivo) {
    if (dispositivo.puertosSeleccionados.length === 0) {
        console.warn(`No se seleccionaron puertos para ${dispositivo.macAddress}`);
        return;
    }

    const idsPuertos = dispositivo.puertosSeleccionados.map(puerto => puerto.puerto_id);
    dispositivo.cargandoRecomendaciones = true; // 🔹 Activar spinner

    this.servicioAnalisisVulnerabilidades.generarRecomendacionesPorPuertosSeleccionados(idsPuertos)
        .subscribe(() => {
            this.servicioAnalisisVulnerabilidades.obtenerRecomendacionesPorPuertos(idsPuertos)
                .subscribe(respuesta => {
                    this.listaRecomendaciones = respuesta.data.puertos;
                    this.dialogoVisible = true;
                    dispositivo.puertosSeleccionados = [];
                })
                .add(() => dispositivo.cargandoRecomendaciones = false); 
        }, () => {
            dispositivo.cargandoRecomendaciones = false; // 
        });
  }


}
