import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiciosSegundoPlano {
  private intervalosActivos = new Map<string, Subscription>();

  constructor() {}

  /**
   * 🔁 Inicia un proceso de polling asociado a una clave de localStorage.
   */
  iniciarProcesoConPolling(
    claveStorage: string,
    intervaloMs: number,
    verificarEstado: () => any,
    alFinalizar: () => void,
    alError: (mensaje?: string) => void,
    actualizarProgreso?: () => void
  ): void {
    localStorage.setItem(claveStorage, 'true');

    const intervalo = interval(intervaloMs).subscribe(() => {
      actualizarProgreso?.();

      verificarEstado().subscribe({
        next: (res: any) => {
          const estado = res?.estado;

          if (estado === 'completado') {
            this.finalizarProceso(claveStorage, alFinalizar, actualizarProgreso);
          } else if (estado === 'cancelado' || estado?.startsWith('error')) {
            this.terminarConError(claveStorage, alError, estado);
          }
        },
        error: () => this.terminarConError(claveStorage, alError, 'Error de red o backend')
      });
    });

    this.intervalosActivos.set(claveStorage, intervalo);
  }

  /**
   * ♻️ Reanuda un polling si la clave está activa en localStorage.
   */
  reanudarSiEsNecesario(
    claveStorage: string,
    intervaloMs: number,
    verificarEstado: () => any,
    alFinalizar: () => void,
    alError: (mensaje?: string) => void,
    actualizarProgreso?: () => void
  ): void {
    if (localStorage.getItem(claveStorage) !== 'true') return;

    console.log(`♻️ Reanudando proceso ${claveStorage}...`);

    verificarEstado().subscribe({
      next: (res: any) => {
        const estado = res?.estado;

        if (estado === 'completado' || estado === 'cancelado') {
          this.detenerProceso(claveStorage);
          alFinalizar();
        } else if (!this.intervalosActivos.has(claveStorage)) {
          this.iniciarProcesoConPolling(claveStorage, intervaloMs, verificarEstado, alFinalizar, alError, actualizarProgreso);
        } else {
          actualizarProgreso?.();
        }
      },
      error: (err: any) => {
        this.terminarConError(claveStorage, alError, err?.error?.detail || 'Error al consultar el estado del proceso.');
      }
    });
  }

  /**
   * ⛔ Detiene un proceso de polling y limpia la clave en localStorage.
   */
  detenerProceso(claveStorage: string): void {
    this.intervalosActivos.get(claveStorage)?.unsubscribe();
    this.intervalosActivos.delete(claveStorage);
    localStorage.removeItem(claveStorage);
  }

  // 🔒 Métodos internos para limpieza
  private finalizarProceso(clave: string, callback: () => void, actualizarProgreso?: () => void): void {
    try {
      actualizarProgreso?.();
    } catch (e) {
      console.warn(`⚠️ Error en progreso final de ${clave}:`, e);
    }

    setTimeout(() => {
      this.detenerProceso(clave);
      callback();
    }, 500);
  }

  private terminarConError(clave: string, callback: (msg?: string) => void, mensaje: string): void {
    this.detenerProceso(clave);
    callback(mensaje);
  }
}
