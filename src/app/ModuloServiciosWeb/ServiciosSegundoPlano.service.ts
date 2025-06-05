import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosSegundoPlano {
  private intervalosActivos: Map<string, Subscription | number> = new Map();

  /**
   * 🔁 Inicia un proceso en segundo plano con localStorage y callback de verificación.
   * @param claveStorage Ej: 'escaneoEnProgreso'
   * @param intervaloMs Frecuencia del polling en milisegundos
   * @param verificarEstado Función que retorna un Observable con la respuesta del estado
   * @param alFinalizar Callback cuando el proceso finaliza exitosamente
   * @param alError Callback cuando hay error en la respuesta o polling
   */
  iniciarProcesoConPolling(
    claveStorage: string,
    intervaloMs: number,
    verificarEstado: () => any,
    alFinalizar: () => void,
    alError: (mensaje?: string) => void
  ): void {
    localStorage.setItem(claveStorage, 'true');

    const intervalo = interval(intervaloMs).subscribe(() => {
      verificarEstado().subscribe({
        next: (res: any) => {
          if (res.estado === 'completado') {
            this.detenerProceso(claveStorage);
            alFinalizar();
          } else if (res.estado?.startsWith('error')) {
            this.detenerProceso(claveStorage);
            alError(res.estado);
          }
        },
        error: () => {
          this.detenerProceso(claveStorage);
          alError('Error de red o backend');
        }
      });
    });

    this.intervalosActivos.set(claveStorage, intervalo);
  }

  /**
   * ✅ Reanuda el polling si el valor en localStorage indica que está en progreso
   */
  reanudarSiEsNecesario(
  claveStorage: string,
  intervaloMs: number,
  verificarEstado: () => any,
  alFinalizar: () => void,
  alError: (mensaje?: string) => void
): void {
  const enProgreso = localStorage.getItem(claveStorage);

  if (enProgreso === 'true') {
    console.log(`♻️ Reanudando verificación inmediata de ${claveStorage}...`);

    verificarEstado().subscribe({
      next: (res: any) => {
        if (res.estado === 'completado') {
          this.detenerProceso(claveStorage);
          localStorage.removeItem(claveStorage); // ✅ Limpieza obligatoria
          alFinalizar();
        } else {
          if (!this.intervalosActivos.has(claveStorage)) {
            console.log(`🔁 Reanudando polling de ${claveStorage}...`);
            this.iniciarProcesoConPolling(claveStorage, intervaloMs, verificarEstado, () => {
              localStorage.removeItem(claveStorage); // ✅ también al finalizar por polling
              alFinalizar();
            }, (mensaje) => {
              localStorage.removeItem(claveStorage); // ✅ también al fallar por polling
              alError(mensaje);
            });
          }
        }
      },
      error: (err: any) => {
        console.warn(`⚠️ Error al verificar el estado de ${claveStorage}`, err);
        this.detenerProceso(claveStorage);
        localStorage.removeItem(claveStorage); // ✅ Limpieza por error inmediato
        alError(err?.error?.detail || 'Error al consultar el estado del proceso.');
      }
    });
  }
}




  /**
   * ⛔ Detiene y limpia el polling de un proceso
   */
  detenerProceso(claveStorage: string): void {
    const intervalo = this.intervalosActivos.get(claveStorage);
    if (intervalo) {
      (intervalo as Subscription).unsubscribe?.();
      this.intervalosActivos.delete(claveStorage);
    }
    localStorage.removeItem(claveStorage);
  }
}
