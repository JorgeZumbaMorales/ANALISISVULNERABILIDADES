import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

interface ProcesoConfig {
  intervaloMs: number;
  obtenerEstado: () => any; // Idealmente Observable<{ estado: string }>
  alFinalizar: () => void;
  alError?: (mensaje?: string) => void;
  alIterar?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ServicioSegundoPlano {
  private procesos: Record<string, Subscription> = {};

  iniciar(clave: string, config: ProcesoConfig): void {
  const yaActivo = this.procesos[clave];

  if (yaActivo) {
    console.log(`[ServicioSegundoPlano] Ya existe proceso para ${clave}, actualizando callbacks`);
    this.reconfigurar(clave, config);
    return;
  }

  // ⚠️ Si localStorage dice que está activo pero no hay suscripción viva → reiniciar
  const enLocal = localStorage.getItem(clave);
  if (enLocal === 'activo') {
    console.warn(`[ServicioSegundoPlano] Estado inconsistente: ${clave} estaba en localStorage pero sin proceso activo. Reiniciando.`);
  }

  // Registrar proceso
  localStorage.setItem(clave, 'activo');

  this.procesos[clave] = interval(config.intervaloMs).subscribe(() => {
    config.obtenerEstado().subscribe({
      next: ({ estado }: any) => {
        console.log('[Polling] Estado actual:', JSON.stringify(estado));

        if (['completado', 'cancelado'].includes(estado)) {
          this.detener(clave);
          config.alFinalizar();
        } else {
          config.alIterar?.();
        }
      },
      error: (err: any) => {
        this.detener(clave);
        config.alError?.('Error al consultar estado');
        console.error(`[Polling ${clave}]`, err);
      }
    });
  });
}


// ➕ NUEVO: Permite actualizar callbacks aunque ya esté activo
private reconfigurar(clave: string, nuevoConfig: ProcesoConfig): void {
  const estado = localStorage.getItem(clave);
  if (estado !== 'activo') return;

  // Simular un "alIterar" inmediato para actualizar interfaz
  nuevoConfig.obtenerEstado().subscribe({
    next: ({ estado }: any) => {
      if (!['completado', 'cancelado'].includes(estado)) {
        nuevoConfig.alIterar?.();
      }
    }
  });
}

  detener(clave: string): void {
    this.procesos[clave]?.unsubscribe();
    delete this.procesos[clave];
  }
}
