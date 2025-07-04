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
  puerto_id?: number;     // Opcional porque los puertos detectados en la evaluación pueden no tener ID
  numero: number;
  servicio?: string;
  protocolo?: string;     // ✅ Añadido
  version?: string;       // ✅ Añadido
  label?: string;
}


interface Dispositivo {
  nombreDispositivo: string;
  ip: string;  // ✅ Nueva propiedad
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
  
  dispositivoSeleccionado: any = null;
  riesgoEvaluado: string = '';
justificacionEvaluada: string = '';
puertosDetectados: Puerto[] = [];
nombreDispositivoEvaluado: string = '';
macEvaluada: string = '';
ipEvaluada: string = '';
sistemaOperativo: string = '';
precisionSO: number = 0;
puertosSeleccionados: any[] = [];
cargandoRecomendaciones: boolean = false;

  listaRecomendaciones: any[] = [];
  dialogoVisible = false;
  evaluacionCompletada = false;
  dispositivos: Dispositivo[] = [];
  evaluacionEnProgreso: boolean = false;

  ngOnInit(): void {
    
  this.cargarDispositivos();

  // Recuperar resultados de evaluación desde localStorage
  const datosGuardados = localStorage.getItem('evaluacionDispositivo');
  if (datosGuardados) {
    const data = JSON.parse(datosGuardados);
    this.nombreDispositivoEvaluado = data.nombreDispositivoEvaluado;
    this.ipEvaluada = data.ipEvaluada;
    this.macEvaluada = data.macEvaluada;
    this.sistemaOperativo = data.sistemaOperativo;
    this.precisionSO = data.precisionSO;
    this.riesgoEvaluado = data.riesgoEvaluado;
    this.justificacionEvaluada = data.justificacionEvaluada;
    this.puertosDetectados = data.puertosDetectados || [];
    this.evaluacionCompletada = true;
  }
}


  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private servicioAnalisis: ServiciosAnalisisVulnerabilidades,
    private sesionUsuario: SesionUsuarioService,
    private servicioAlertas: ServiciosAlertas,
    private notificacion: NotificacionService,
    private servicioSegundoPlano: ServicioSegundoPlano,
    private confirmationService: ConfirmationService,


  ) {}


private cargarDispositivos(): void {
  this.servicioDispositivos.listarDispositivosCompleto().subscribe({
    next: ({ data }) => {
      console.log('Dispositivos cargados:', data);
      this.dispositivos = data.map((d: any) => ({
        ...d,
        etiquetaBusqueda: `${d.nombre_dispositivo} ${d.mac_address} ${d.ultima_ip}` // 👈 esta es la clave
      }));
    },
    error: (err) => {
      console.error('❌ Error al cargar dispositivos:', err);
      this.notificacion.error('Error', 'No se pudieron cargar los dispositivos.');
    }
  });
}

evaluarDispositivoSeleccionado(): void {
  this.resetearEstadoLocalEvaluacion(); // ✅ limpieza instantánea

  if (!this.dispositivoSeleccionado) return;

  const datos = {
    ip: this.dispositivoSeleccionado.ultima_ip,
    mac: this.dispositivoSeleccionado.mac_address
  };

  this.evaluacionEnProgreso = true;

  this.servicioAnalisis.evaluarRiesgoDispositivoIndividual(datos).subscribe({
    next: () => {
      this.servicioSegundoPlano.iniciar('evaluacion_riesgo', {
        intervaloMs: 3000,
        obtenerEstado: () => this.servicioAnalisis.obtenerEstadoEvaluacionIndividual(),
        alFinalizar: () => {
          this.servicioAnalisis.obtenerResultadoEvaluacionIndividual().subscribe({
            next: (respuesta) => {
              console.log('✅ Resultado completo recibido:', respuesta);
  const data = respuesta.data;
  this.nombreDispositivoEvaluado = data.nombre_dispositivo;
this.macEvaluada = data.mac_address;
this.ipEvaluada = data.ip;
this.sistemaOperativo = data.sistema_operativo?.nombre || 'Desconocido';
this.precisionSO = data.sistema_operativo?.precision || 0;

  this.riesgoEvaluado = data.riesgo;
  this.justificacionEvaluada = data.descripcion;
  this.puertosDetectados = (data.puertos_abiertos || []).map((p: any) => ({
    puerto_id: p.puerto_id,
  numero: p.numero,
  servicio: p.servicio,
  protocolo: p.protocolo,
  version: p.version
}));
  // Guardar en localStorage
localStorage.setItem('evaluacionDispositivo', JSON.stringify({
  nombreDispositivoEvaluado: this.nombreDispositivoEvaluado,
  ipEvaluada: this.ipEvaluada,
  macEvaluada: this.macEvaluada,
  sistemaOperativo: this.sistemaOperativo,
  precisionSO: this.precisionSO,
  riesgoEvaluado: this.riesgoEvaluado,
  justificacionEvaluada: this.justificacionEvaluada,
  puertosDetectados: this.puertosDetectados
}));

  this.evaluacionCompletada = true;
  this.evaluacionEnProgreso = false;
  this.crearNotificacionFinalizacionEvaluacion();

}
,
            error: () => {
              this.evaluacionEnProgreso = false;
              this.notificacion.error('Error', 'No se pudo obtener el resultado.');
            }
          });
        },
        alError: (msg) => {
          this.evaluacionEnProgreso = false;
          this.notificacion.error('Error', msg || 'Error desconocido.');
        },
        alIterar: () => {
          console.log('⏳ Evaluación aún en proceso...');
        }
      });
    },
    error: () => {
      this.evaluacionEnProgreso = false;
      this.notificacion.error('Error', 'No se pudo iniciar la evaluación.');
    }
  });
}

limpiarEvaluacion(): void {
  this.servicioAnalisis.limpiarResultadoEvaluacionIndividual().subscribe({
    next: () => {
      this.resetearEstadoLocalEvaluacion(); 
      localStorage.removeItem('evaluacionDispositivo');
      this.listaRecomendaciones = [];
      this.evaluacionCompletada = false;
      this.dialogoVisible = false;
      this.notificacion.success('Evaluación limpiada', 'Puedes realizar una nueva evaluación.');
    },
    error: () => {
      this.notificacion.error('Error', 'No se pudo limpiar la evaluación.');
    }
  });
}

private resetearEstadoLocalEvaluacion(): void {
  localStorage.removeItem('evaluacionDispositivo');
  this.listaRecomendaciones = [];
  this.evaluacionCompletada = false;
  this.dialogoVisible = false;
  this.nombreDispositivoEvaluado = '';
  this.ipEvaluada = '';
  this.macEvaluada = '';
  this.sistemaOperativo = '';
  this.precisionSO = 0;
  this.riesgoEvaluado = '';
  this.justificacionEvaluada = '';
  this.puertosDetectados = [];
  this.puertosSeleccionados = [];
}







private crearNotificacionFinalizacionEvaluacion(): void {
  const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
  if (!usuario_id) return;

  const notificacion = {
    mensaje_notificacion: `Evaluación de riesgo finalizada para el dispositivo ${this.nombreDispositivoEvaluado} (${this.ipEvaluada}). Nivel de riesgo: ${this.riesgoEvaluado}.`,
    tipo_alerta_id: 1, // informativo
    canal_alerta_id: 1, // canal web por defecto
    usuario_id,
    dispositivo_id: null // puedes poner el ID si lo tienes
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación de evaluación creada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
}


generarRecomendaciones(): void {
  const ids = this.puertosSeleccionados
    .map(p => p.puerto_id)
    .filter((id): id is number => id !== undefined);

  if (!ids.length) {
    this.notificacion.warning('Advertencia', 'Selecciona al menos un puerto válido.');
    return;
  }

  this.cargandoRecomendaciones = true;

  this.servicioAnalisis.generarRecomendacionesPorPuertosSeleccionados(ids).subscribe({
    next: () => {
      this.servicioAnalisis.obtenerRecomendacionesPorPuertos(ids).subscribe({
        next: ({ data }) => {
          this.listaRecomendaciones = data.puertos;
          this.dialogoVisible = true;
          this.puertosSeleccionados = [];
        },
        complete: () => this.cargandoRecomendaciones = false,
        error: () => {
          this.cargandoRecomendaciones = false;
          this.notificacion.error('Error', 'No se pudieron obtener las recomendaciones.');
        }
      });
    },
    error: () => {
      this.cargandoRecomendaciones = false;
      this.notificacion.error('Error', 'No se pudieron generar las recomendaciones.');
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
