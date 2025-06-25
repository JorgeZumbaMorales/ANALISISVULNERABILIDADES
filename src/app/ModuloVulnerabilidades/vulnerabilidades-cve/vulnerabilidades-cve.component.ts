import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { NgZone,ChangeDetectorRef } from '@angular/core';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component'; 

@Component({
  selector: 'app-vulnerabilidades-cve',
  templateUrl: './vulnerabilidades-cve.component.html',
  styleUrls: ['./vulnerabilidades-cve.component.css'],
  providers: [MessageService]
})
export class VulnerabilidadesCveComponent implements OnInit {
  dispositivos: any[] = [];
  dispositivoSeleccionado: any = null;
  vulnerabilidadesDetalle: any[] = [];
  puertoSeleccionado: any = null;
  resumenTecnico: any[] = [];
  cvesSeleccionados: any[] = [];
  dialogoCvesVisible = false;
  busquedaCve: string = '';
  puertoSeleccionadoChip: any = null;
  cargando = false;
  analisisEnProgreso = false;
  analisisFinalizado = false;
  resultadoPersistente = false;
  mensajeErrorAnalisis: string | null = null;

  riesgosDisponiblesFiltrados: number[] = [];
  opcionesExploitFiltradas: boolean[] = [];
  tiposDisponiblesFiltrados: string[] = [];
  bloquesResumen: { titulo: string; clave: 'estado' | 'analisis' | 'riesgos' }[] = [
  { titulo: 'Estado del Servicio', clave: 'estado' },
  { titulo: 'Análisis Técnico del Escaneo', clave: 'analisis' },
  { titulo: 'Riesgos Identificados', clave: 'riesgos' }
];



  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private procesoSegundoPlano: ServiciosSegundoPlano,
    private notificacion: NotificacionService,
    private servicioAlertas: ServiciosAlertas,
    private messageService: MessageService,
    private sesionUsuario: SesionUsuarioService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

 
ngOnInit(): void {
    this.cargarDispositivos();
    this.recuperarDatosLocales();

    const enProgreso = localStorage.getItem('analisisEnProgreso') === 'true';
    this.analisisEnProgreso = enProgreso;

    if (enProgreso) {
      this.cargando = true;

      this.procesoSegundoPlano.reanudarSiEsNecesario(
        'analisisEnProgreso',
        3000,
        () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
        () => {
          this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
            next: resultado => {
              this.ngZone.run(() => {
                this.procesarResultadoAnalisis(resultado);
                this.crearNotificacionFinalizacion();
                this.cdr.detectChanges();
              });
            },
            error: () => {
              this.ngZone.run(() => {
                this.terminarConError('Error al recuperar resultado del análisis');
                this.cdr.detectChanges();
              });
            }
          });
        },
        mensajeError => {
          this.ngZone.run(() => {
            this.terminarConError(mensajeError ?? 'Error durante el análisis');
            this.cdr.detectChanges();
          });
        }
      );
    } else {
      this.reanudarSiEstabaFinalizado();
    }
  }



  private cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data || [];
        const guardado = localStorage.getItem('dispositivoSeleccionado');
        if (guardado) {
          const temp = JSON.parse(guardado);
          this.dispositivoSeleccionado = this.dispositivos.find(d => d.dispositivo_id === temp.dispositivo_id);
        }
      },
      error: () => this.notificacion.error('No se pudieron cargar los dispositivos')
    });
  }

  private recuperarDatosLocales(): void {
  const datos = localStorage.getItem('vulnerabilidadesDetalle');
  const resumen = localStorage.getItem('resumenesPorPuerto');

  if (datos) {
    this.vulnerabilidadesDetalle = JSON.parse(datos);
    this.resultadoPersistente = true;
    this.analisisFinalizado = true;
  }

  if (resumen) {
    this.resumenTecnico = JSON.parse(resumen);
  }

  // ✅ Seleccionar primer puerto si está disponible y no hay uno ya seleccionado
  if (!this.puertoSeleccionado && this.resumenTecnico.length > 0) {
    this.puertoSeleccionado = this.resumenTecnico[0];
    this.puertoSeleccionadoChip = this.resumenTecnico[0];
    this.actualizarFiltrosPorPuerto();
  }
}


  private verificarProcesoEnSegundoPlano(): void {
    this.procesoSegundoPlano.reanudarSiEsNecesario(
      'analisisEnProgreso',
      3000,
      () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
      () => this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
        next: resultado => this.procesarResultadoAnalisis(resultado),
        error: () => this.terminarConError('Error al recuperar vulnerabilidades')
      }),
      mensajeError => this.terminarConError(mensajeError ?? 'Error desconocido')

    );
  }

  escanearDispositivo(): void {
  if (!this.dispositivoSeleccionado) {
    this.notificacion.error('Selecciona un dispositivo antes de escanear');
    return;
  }

  this.limpiarSoloResultado();
  this.analisisEnProgreso = true;
  this.cargando = true;
  localStorage.setItem('analisisEnProgreso', 'true');

  const datos = {
    dispositivo_id: this.dispositivoSeleccionado.dispositivo_id,
    mac_address: this.dispositivoSeleccionado.mac_address,
    ip_actual: this.dispositivoSeleccionado.ultima_ip
  };

  this.vulnerabilidadServicio.ejecutarEscaneoAvanzado(datos).subscribe({
    next: ({ mensaje }) => {
      this.notificacion.success(mensaje || 'Análisis iniciado correctamente');
      localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));

      this.procesoSegundoPlano.iniciarProcesoConPolling(
        'analisisEnProgreso',
        3000,
        () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
        () => {
          this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
            next: resultado => {
              this.ngZone.run(() => {
                this.procesarResultadoAnalisis(resultado);
                this.crearNotificacionFinalizacion();
                this.cdr.detectChanges(); // 💥 Forzar redibujado
              });
            },
            error: () => {
              this.ngZone.run(() => {
                this.terminarConError('Error al obtener resultado del análisis');
                this.cdr.detectChanges();
              });
            }
          });
        },
        mensajeError => {
          this.ngZone.run(() => {
            this.terminarConError(mensajeError ?? 'Error durante el análisis');
            this.cdr.detectChanges();
          });
        }
      );
    },
    error: () => this.terminarConError('No se pudo iniciar el análisis')
  });
}



  private terminarConError(mensaje: string): void {
  this.ngZone.run(() => {
    this.notificacion.error(mensaje);
    this.analisisEnProgreso = false;
    this.cargando = false;
    localStorage.removeItem('analisisEnProgreso');
  });
}



private procesarResultadoAnalisis(resultado: any): void {
  this.vulnerabilidadesDetalle = resultado.vulnerabilidades || [];
  this.resumenTecnico = resultado.resumenes_por_puerto || [];

  if (!resultado.dispositivo_activo) {
    this.mensajeErrorAnalisis = resultado.mensaje || 'El dispositivo ya no está activo en la red.';

    // 🔴 Eliminar el dispositivo desactivado de la lista y limpiar selección
    const idInactivo = this.dispositivoSeleccionado?.dispositivo_id;
    if (idInactivo) {
      this.dispositivos = this.dispositivos.filter(d => d.dispositivo_id !== idInactivo);
      this.dispositivoSeleccionado = null;
      localStorage.removeItem('dispositivoSeleccionado');
    }

    this.notificacion.warning('Advertencia', this.mensajeErrorAnalisis ?? 'Mensaje no disponible');

  }

  this.resultadoPersistente = true;
  this.analisisFinalizado = true;
  this.analisisEnProgreso = false;
  this.cargando = false;

  localStorage.setItem('vulnerabilidadesDetalle', JSON.stringify(this.vulnerabilidadesDetalle));
  localStorage.setItem('resumenesPorPuerto', JSON.stringify(this.resumenTecnico));
  localStorage.removeItem('analisisEnProgreso');

  // ✅ Seleccionar automáticamente el primer puerto si no hay uno ya activo
  if (this.resumenTecnico.length > 0 && !this.puertoSeleccionado) {
    this.puertoSeleccionado = this.resumenTecnico[0];
    this.puertoSeleccionadoChip = this.resumenTecnico[0];
    this.actualizarFiltrosPorPuerto();
  }
}





 limpiarResultado(): void {
  this.vulnerabilidadesDetalle = [];
  this.resumenTecnico = [];
  this.puertoSeleccionado = null;
  this.dispositivoSeleccionado = null; // <-- aquí se elimina la selección del dispositivo
  this.mensajeErrorAnalisis = null;
  this.resultadoPersistente = false;
  this.analisisFinalizado = false;
  this.analisisEnProgreso = false;

  localStorage.removeItem('vulnerabilidadesDetalle');
  localStorage.removeItem('resumenesPorPuerto');
  localStorage.removeItem('analisisEnProgreso');
  localStorage.removeItem('dispositivoSeleccionado'); // <-- también borramos de localStorage por si se había guardado
}
private limpiarSoloResultado(): void {
  this.vulnerabilidadesDetalle = [];
  this.resumenTecnico = [];
  this.puertoSeleccionado = null;
  this.mensajeErrorAnalisis = null;
  this.resultadoPersistente = false;
  this.analisisFinalizado = false;

  localStorage.removeItem('vulnerabilidadesDetalle');
  localStorage.removeItem('resumenesPorPuerto');
}


  generarResumenTecnico(): void {
  if (!this.dispositivoSeleccionado) {
    this.notificacion.error('Selecciona un dispositivo antes de generar el resumen');
    return;
  }

  const id = this.dispositivoSeleccionado.dispositivo_id;
  this.notificacion.info('Generando resumen técnico...', 'Procesando');

  this.vulnerabilidadServicio.generarResumenPorDispositivo(id).subscribe({
    next: ({ data }) => {
      this.resumenTecnico = data || [];

      // Limpieza previa de selecciones
      this.puertoSeleccionado = null;
      this.puertoSeleccionadoChip = null;

      // Seleccionamos automáticamente el primer resumen (si hay)
      if (this.resumenTecnico.length > 0) {
        this.puertoSeleccionado = this.resumenTecnico[0];
        this.puertoSeleccionadoChip = this.resumenTecnico[0];
      } else {
        this.notificacion.warning('No se generaron resúmenes. Verifica si hay vulnerabilidades.');
      }
    },
    error: () => this.notificacion.error('Ocurrió un error al generar el resumen técnico')
  });
}


  consultarResultadoAnterior(): void {
  if (!this.dispositivoSeleccionado) {
    this.notificacion.error('Selecciona un dispositivo para consultar vulnerabilidades.');
    return;
  }

  const id = this.dispositivoSeleccionado.dispositivo_id;
  this.cargando = true;

  this.vulnerabilidadServicio.consultarResumenesYCvesPorDispositivo(id).subscribe({
    next: ({ data }) => {
      if (!data || data.length === 0) {
        this.notificacion.warning('No se encontraron resultados de un análisis.');
        this.cargando = false;
        return;
      }

      const resultado = {
        dispositivo_activo: true,
        vulnerabilidades: data,
        resumenes_por_puerto: data.map((puerto: any) => ({
          puerto: puerto.puerto,
          servicio: puerto.servicio,
          resumen: puerto.resumen,
          vulnerabilidades: puerto.vulnerabilidades || []
        }))
      };

      this.ngZone.run(() => {
        this.procesarResultadoAnalisis(resultado);
        localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
        this.cdr.detectChanges();
      });
    },
    error: () => {
      this.cargando = false;
      this.notificacion.error('Ocurrió un error al consultar el escaneo anterior desde base de datos.');
    }
  });
}

  actualizarFiltrosPorPuerto(): void {
  const vuls: any[] = this.puertoSeleccionado?.vulnerabilidades ?? [];

  this.riesgosDisponiblesFiltrados = Array.from(
    new Set<number>(vuls.map((v: any) => Number(v.score)))
  ).sort((a, b) => b - a);

  this.opcionesExploitFiltradas = Array.from(
    new Set<boolean>(vuls.map((v: any) => Boolean(v.exploit)))
  );

  this.tiposDisponiblesFiltrados = Array.from(
    new Set<string>(
      vuls
        .map((v: any) => (typeof v.tipo === 'string' ? v.tipo.trim() : undefined))
        .filter((t): t is string => typeof t === 'string' && t.length > 0)
    )
  );
}




  onChangeDispositivo(): void {
    if (this.dispositivoSeleccionado) {
      localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
    }
  }

  abrirModalCves(resumen: any): void {
    if (resumen.vulnerabilidades?.length > 0) {
      this.cvesSeleccionados = resumen.vulnerabilidades;
      this.dialogoCvesVisible = true;
    } else {
      this.notificacion.info('Este puerto no tiene CVEs relacionados.');
    }
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }
  actualizarPuertoSeleccionado(puerto: any): void {
  this.puertoSeleccionado = puerto;
  this.actualizarFiltrosPorPuerto();
}

private crearNotificacionFinalizacion(): void {
  const usuario_id = this.sesionUsuario?.obtenerUsuarioDesdeToken?.()?.usuario_id;
  if (!usuario_id) return;

  const notificacion = {
    mensaje_notificacion: 'Análisis de vulnerabilidades completado correctamente.',
    tipo_alerta_id: 1,
    canal_alerta_id: 1,
    usuario_id,
    dispositivo_id: this.dispositivoSeleccionado?.dispositivo_id || null
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación de análisis enviada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
}
 private reanudarSiEstabaFinalizado(): void {
    const data = localStorage.getItem('vulnerabilidadesDetalle');
    const resumen = localStorage.getItem('resumenesPorPuerto');

    if (data) {
      this.ngZone.run(() => {
        this.vulnerabilidadesDetalle = JSON.parse(data);
        this.resultadoPersistente = true;
        this.analisisFinalizado = true;
        this.analisisEnProgreso = false;
        this.cargando = false;

        if (this.vulnerabilidadesDetalle.length > 0) {
          this.puertoSeleccionado = this.vulnerabilidadesDetalle[0];
          this.actualizarFiltrosPorPuerto();
        }

        if (resumen) {
          this.resumenTecnico = JSON.parse(resumen);
        }

        this.cdr.detectChanges();
      });
    }
  }

obtenerBloque(tipo: 'estado' | 'analisis' | 'riesgos'): string {
  const resumen = this.puertoSeleccionado?.resumen || '';
  const patrones = {
    estado: 'Estado general del puerto y su servicio:',
    analisis: 'Análisis técnico del resultado del escaneo:',
    riesgos: 'Riesgos identificados o potenciales:',
  };

  const inicio = resumen.indexOf(`• ${patrones[tipo]}`);
  if (inicio === -1) return '';

  const siguientes = Object.values(patrones)
    .filter(t => t !== patrones[tipo])
    .map(t => resumen.indexOf(`• ${t}`))
    .filter(i => i > inicio);

  const finBloque = siguientes.length > 0 ? Math.min(...siguientes) : resumen.length;

  const bloqueExtraido = resumen.slice(inicio + patrones[tipo].length + 2, finBloque).trim();

  if (tipo === 'riesgos') {
    const corte = bloqueExtraido.indexOf('• Recomendaciones específicas:');
    return corte !== -1 ? bloqueExtraido.slice(0, corte).trim() : bloqueExtraido;
  }

  return bloqueExtraido;
}


obtenerRecomendaciones(resumen: string): string[] {
  const inicio = resumen.indexOf('• Recomendaciones específicas:');
  if (inicio === -1) return [];

  const bloque = resumen.slice(inicio + '• Recomendaciones específicas:'.length).trim();

  const recomendacionNumerada = bloque.split(/\d+\.\s+/).slice(1).map(line => line.trim()).filter(line => line.length > 0);
  if (recomendacionNumerada.length > 0) {
    return recomendacionNumerada;
  }

  // Si no hay numeración, pero hay contenido plano
  if (bloque.length > 0) {
    return [bloque];
  }

  return [];
}



}
