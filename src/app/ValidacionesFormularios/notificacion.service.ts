import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private messageService: MessageService) { }

  success(titulo: string, mensaje: string = '') {
    this.messageService.add({ severity: 'success', summary: titulo, detail: mensaje });
  }

  error(titulo: string, mensaje: string = '') {
    this.messageService.add({ severity: 'error', summary: titulo, detail: mensaje });
  }

  warning(titulo: string, mensaje: string = '') {
    this.messageService.add({ severity: 'warn', summary: titulo, detail: mensaje });
  }

  info(titulo: string, mensaje: string = '') {
    this.messageService.add({ severity: 'info', summary: titulo, detail: mensaje });
  }
}


