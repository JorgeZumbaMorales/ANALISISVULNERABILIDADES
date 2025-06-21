import { Component } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { interval, Subscription } from 'rxjs';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { MessageService } from 'primeng/api';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component'; 
import { ServiciosSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ChangeDetectorRef } from '@angular/core';

interface Puerto {
  puerto_id: number;
  numero: number;
  servicio?: string;
}

interface Dispositivo {
  nombreDispositivo: string;
  macAddress: string;
  riesgo: string;
  descripcion?: string;
  puertosAbiertos: Puerto[];
  puertosSeleccionados: Puerto[];
  cargandoRecomendaciones?: boolean;
}


@Component({
  selector: 'app-pg-dispositivos-vulnerables',
  templateUrl: './pg-dispositivos-vulnerables.component.html',
  styleUrls: ['./pg-dispositivos-vulnerables.component.css']
})
export class PgDispositivosVulnerablesComponent {


tarjetasRiesgo = [
  { valor: 'Alto', titulo: 'Riesgo Alto', color: 'text-baseNaranja', borde: 'border-baseNaranja', icono: 'pi pi-exclamation-triangle' },
  { valor: 'Medio', titulo: 'Riesgo Medio', color: 'text-yellow-600', borde: 'border-baseNaranja', icono: 'pi pi-exclamation-circle' },
  { valor: 'Bajo', titulo: 'Riesgo Bajo', color: 'text-blue-600', borde: 'border-baseNaranja', icono: 'pi pi-info-circle' },
  { valor: 'Sin Riesgo', titulo: 'Sin Riesgo', color: 'text-gray-600', borde: 'border-baseNaranja', icono: 'pi pi-check-circle' }
];

  listaRecomendaciones: any[] = [];
  dialogoVisible = false;

  evaluacionEnProgreso = false;
  evaluacionCompletada = false;
  dispositivos: Dispositivo[] = [];



  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private servicioAnalisis: ServiciosAnalisisVulnerabilidades,
    private sesionUsuario: SesionUsuarioService,
    private servicioAlertas: ServiciosAlertas,
    private servicioSegundoPlano: ServiciosSegundoPlano,
    private notificacion: NotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  private formatearDispositivo(d: any): Dispositivo {
  return {
    nombreDispositivo: d.nombre_dispositivo || 'Sin nombre',
    macAddress: d.mac_address,
    riesgo: d.riesgo || 'Sin Riesgo',
    descripcion: d.descripcion || '',
    puertosAbiertos: (d.puertos_abiertos || []).map((p: any) => ({
      puerto_id: p.puerto_id,
      numero: p.numero,
      servicio: p.servicio || 'Desconocido',
      label: `${p.numero} - ${p.servicio || 'Desconocido'}`  // 🔹 Aquí formateas la opción
    })),
    puertosSeleccionados: [],
    cargandoRecomendaciones: false
  };
}



ngOnInit(): void {
  const enProgreso = localStorage.getItem('evaluacionEnProgreso');
  this.evaluacionEnProgreso = enProgreso === 'true';

  this.servicioSegundoPlano.reanudarSiEsNecesario(
    'evaluacionEnProgreso',
    4000,
    () => this.servicioAnalisis.obtenerEstadoEvaluacionRiesgo(),
    () => {
      this.evaluacionEnProgreso = false;
      this.evaluacionCompletada = true;
      this.cargarDispositivos();
      this.crearNotificacionFinalizacion();
    },
    (mensaje) => {
      this.evaluacionEnProgreso = false;
      this.notificacion.error('Error en evaluación', mensaje);
    }
  );


  const ignorarEvaluacion = localStorage.getItem('evaluacionIgnorada') === 'true';

  if (!this.evaluacionEnProgreso && !this.evaluacionCompletada && !ignorarEvaluacion) {
    this.servicioAnalisis.obtenerEstadoEvaluacionRiesgo().subscribe({
      next: ({ estado }) => {
        if (estado === 'completado') {
          this.evaluacionCompletada = true;
          this.cargarDispositivos();
        }
      },
      error: (err) => console.warn('⚠️ Error al verificar estado en ngOnInit:', err)
    });
  }
}

limpiarEstadoEvaluacion(): void {
  this.evaluacionCompletada = false;
  this.evaluacionEnProgreso = false;
  this.dispositivos = [];

  localStorage.removeItem('evaluacionEnProgreso');
  localStorage.setItem('evaluacionIgnorada', 'true');

  this.cdr.detectChanges(); // 🔁 fuerza redibujado inmediato

  this.notificacion.info('Evaluación limpiada', 'Puedes realizar una nueva evaluación.');
}




  cargarDispositivos() {
  this.servicioAnalisis.obtenerResultadoUltimoRiesgo().subscribe({
    next: (res) => {
      const resultado = res.dispositivos.map((d: any) => this.formatearDispositivo(d));
      this.dispositivos = resultado;
      console.log('✅ Dispositivos evaluados:', this.dispositivos);
    },
    error: (err) => {
      console.error('❌ Error al cargar dispositivos evaluados:', err);
      this.dispositivos = [];
    }
  });
}
  obtenerDispositivos(riesgo: string): Dispositivo[] {
  return this.dispositivos.filter(d => d.riesgo === riesgo);
}
  obtenerColorEtiqueta(riesgo: string): 'info' | 'warn' | 'danger' | 'secondary' {
    return (
      { Alto: 'danger', Medio: 'warn', Bajo: 'info', 'Sin Riesgo': 'secondary' } as const
    )[riesgo] || 'secondary';
  }
  mostrarRecomendaciones(dispositivo: Dispositivo) {
    if (!dispositivo.puertosSeleccionados.length) {
      console.warn(`No se seleccionaron puertos para ${dispositivo.macAddress}`);
      return;
    }

    const ids = dispositivo.puertosSeleccionados.map(p => p.puerto_id);
    dispositivo.cargandoRecomendaciones = true;

    this.servicioAnalisis.generarRecomendacionesPorPuertosSeleccionados(ids).subscribe({
      next: () => {
        this.servicioAnalisis.obtenerRecomendacionesPorPuertos(ids).subscribe({
          next: ({ data }) => {
            this.listaRecomendaciones = data.puertos;
            this.dialogoVisible = true;
            dispositivo.puertosSeleccionados = [];
          },
          complete: () => dispositivo.cargandoRecomendaciones = false
        });
      },
      error: () => dispositivo.cargandoRecomendaciones = false
    });
  }
  iniciarEvaluacionRiesgoConPolling(): void {
  localStorage.removeItem('evaluacionIgnorada');
  const usuario = this.sesionUsuario.obtenerUsuarioDesdeToken();
  if (!usuario?.usuario_id) {
    this.notificacion.error('Error', 'Usuario no autenticado.');

    return;
  }

  this.evaluacionEnProgreso = true;
  this.servicioAnalisis.evaluarRiesgoTodosDispositivos().subscribe({
    next: () => {
      this.notificacion.success('Evaluando...', 'Evaluación de riesgo iniciada.');
      this.servicioSegundoPlano.iniciarProcesoConPolling(
        'evaluacionEnProgreso',
        4000,
        () => this.servicioAnalisis.obtenerEstadoEvaluacionRiesgo(),
        () => {
          this.evaluacionEnProgreso = false;
          this.evaluacionCompletada = true;
          this.cargarDispositivos();
          this.crearNotificacionFinalizacion();
        },
        (mensaje) => {
          this.evaluacionEnProgreso = false;
         this.notificacion.error('Error en evaluación', mensaje);

        }
      );
    },
    error: (err) => {
      console.error('❌ Error al iniciar evaluación:', err);
      this.evaluacionEnProgreso = false;
      localStorage.removeItem('evaluacionEnProgreso');
    }
  });
}
private crearNotificacionFinalizacion(): void {
  const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
  if (!usuario_id) return;

  const notificacion = {
    mensaje_notificacion: "Evaluación de riesgo completada correctamente.",
    tipo_alerta_id: 1,
    canal_alerta_id: 1,
    usuario_id,
    dispositivo_id: null
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación enviada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
} 
obtenerCantidadPorRiesgo(riesgo: string): string {
  return this.obtenerDispositivos(riesgo).length.toString();
}




}
