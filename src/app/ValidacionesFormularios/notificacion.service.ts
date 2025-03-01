import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  
  constructor(private messageService: MessageService) {}

  /** ✅ Función para mostrar mensajes en `toast` */
  mostrarMensaje(severity: 'success' | 'error' | 'warn', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
