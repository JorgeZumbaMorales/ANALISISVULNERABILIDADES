import { Component } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component'; 
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ServicioSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { ConfirmationService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';

interface Puerto {
  puerto_id: number;
  numero: number;
  servicio?: string;
  label?: string;
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
  evaluacionCompletada = false;
  dispositivos: Dispositivo[] = [];
  evaluacionEnProgreso: boolean = false;

  ngOnInit(): void {
  this.verificarEstadoEvaluacion(); // ✅ Verifica si hay evaluación previa
}

  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private servicioAnalisis: ServiciosAnalisisVulnerabilidades,
    private sesionUsuario: SesionUsuarioService,
    private servicioAlertas: ServiciosAlertas,
    private notificacion: NotificacionService,
    private servicioSegundoPlano: ServicioSegundoPlano,
    private confirmationService: ConfirmationService,
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
        label: `${p.numero} - ${p.servicio || 'Desconocido'}`
      })),
      puertosSeleccionados: [],
      cargandoRecomendaciones: false
    };
  }

iniciarEvaluacionRiesgo(): void {
  const usuario = this.sesionUsuario.obtenerUsuarioDesdeToken();
  if (!usuario?.usuario_id) {
    this.notificacion.error('Error', 'Usuario no autenticado.');
    return;
  }

  this.evaluacionEnProgreso = true; // ✅ Mostrar spinner y botón de cancelar

  this.servicioAnalisis.evaluarRiesgoTodosDispositivos().subscribe({
    next: () => {
      this.notificacion.success('Evaluación iniciada', 'Se está procesando la evaluación.');
      this.iniciarSeguimientoEvaluacion();  // 🟢 nuevo seguimiento
    },
    error: (err) => {
      console.error('❌ Error al iniciar evaluación:', err);
      this.evaluacionEnProgreso = false; // ✅ Restaurar estado en caso de error
      this.notificacion.error('Error', 'No se pudo iniciar la evaluación.');
    }
  });
}

private verificarEstadoEvaluacion(): void {
  this.servicioAnalisis.obtenerEstadoEvaluacionRiesgo().subscribe({
    next: (res) => {
      const estado = res.estado;
      if (estado === 'completado') {
        this.evaluacionCompletada = true;
        this.cargarDispositivos();
      } else if (estado === 'en_proceso') {
        this.evaluacionEnProgreso = true;
        this.iniciarSeguimientoEvaluacion();
      }
    },
    error: (err) => {
      console.warn('⚠️ No se pudo verificar estado de evaluación:', err);
    }
  });
}


  cargarDispositivos(): void {
    this.servicioAnalisis.obtenerResultadoUltimoRiesgo().subscribe({
      next: (res) => {
        const resultado = res.dispositivos.map((d: any) => this.formatearDispositivo(d));
        this.dispositivos = resultado;
        this.evaluacionCompletada = true;
        console.log('✅ Dispositivos evaluados:', this.dispositivos);
      },
      error: (err) => {
        console.error('❌ Error al cargar dispositivos evaluados:', err);
        this.dispositivos = [];
        this.evaluacionCompletada = false;
      }
    });
  }

limpiarEstadoEvaluacion(): void {
  this.servicioAnalisis.limpiarResultadoEvaluacionRiesgo().subscribe({
    next: () => {
      this.evaluacionCompletada = false;
      this.dispositivos = [];
      this.notificacion.info('Evaluación limpiada', 'Puedes realizar una nueva evaluación.');
      this.cdr.detectChanges(); // 🧠 Forzar Angular a actualizar vista inmediatamente
    },
    error: (err) => {
      console.error('❌ Error al limpiar evaluación:', err);
      this.notificacion.error('Error', 'No se pudo limpiar la evaluación.');
    }
  });
}



  mostrarRecomendaciones(dispositivo: Dispositivo): void {
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

  obtenerDispositivos(riesgo: string): Dispositivo[] {
    return this.dispositivos.filter(d => d.riesgo === riesgo);
  }

  obtenerCantidadPorRiesgo(riesgo: string): string {
    return this.obtenerDispositivos(riesgo).length.toString();
  }

  obtenerColorEtiqueta(riesgo: string): 'info' | 'warn' | 'danger' | 'secondary' {
    return (
      { Alto: 'danger', Medio: 'warn', Bajo: 'info', 'Sin Riesgo': 'secondary' } as const
    )[riesgo] || 'secondary';
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
  private iniciarSeguimientoEvaluacion(): void {
  this.servicioSegundoPlano.iniciar('evaluacion_riesgo', {
    intervaloMs: 2000,
    obtenerEstado: () => this.servicioAnalisis.obtenerEstadoEvaluacionRiesgo(),

    alIterar: () => {
      // Puedes colocar logs o actualizar estado aquí si deseas
    },

    alFinalizar: () => {
      this.evaluacionEnProgreso = false; // ✅ Oculta spinner y botón
      this.evaluacionCompletada = true;
      this.cargarDispositivos();
      this.notificacion.success('Evaluación completada', 'Se finalizó la evaluación de riesgo.');
      this.crearNotificacionFinalizacion();
    },

    alError: (mensaje?: string) => {
      this.evaluacionEnProgreso = false; // ✅ También ocultar en caso de error
      this.notificacion.error('Error', mensaje ?? 'Error en la evaluación.');
    }
  });
}

abrirDialogoCancelarEvaluacion(): void {
  this.confirmationService.confirm({
    message: '¿Estás seguro de cancelar la evaluación de riesgo?',
    header: 'Cancelar evaluación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cancelar',
    rejectLabel: 'No',
    accept: () => {
      this.servicioAnalisis.cancelarEvaluacionRiesgo().subscribe({
        next: () => {
          this.servicioSegundoPlano.detener('evaluacion_riesgo');
          this.evaluacionEnProgreso = false;
          this.evaluacionCompletada = false;
          this.notificacion.success('Evaluación cancelada', 'La evaluación de riesgo fue cancelada.');
        },
        error: () => {
          this.notificacion.error('Error', 'No se pudo cancelar la evaluación.');
        }
      });
    }
  });
}

}
