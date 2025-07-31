import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

interface ProcesoConfig {
  intervaloMs: number;
  obtenerEstado: () => any; 
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
      
      this.reconfigurar(clave, config);
      return;
    }

    
    const enLocal = localStorage.getItem(clave);
    if (enLocal === 'activo') {
      console.warn(`[ServicioSegundoPlano] Estado inconsistente: ${clave} estaba en localStorage pero sin proceso activo. Reiniciando.`);
    }


    localStorage.setItem(clave, 'activo');

    this.procesos[clave] = interval(config.intervaloMs).subscribe(() => {
      config.obtenerEstado().subscribe({
        next: ({ estado }: any) => {


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


  private reconfigurar(clave: string, nuevoConfig: ProcesoConfig): void {
    const estado = localStorage.getItem(clave);
    if (estado !== 'activo') return;

    
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
