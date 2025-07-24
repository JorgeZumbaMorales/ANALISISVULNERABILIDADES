import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ValidacionesReportesService {
    constructor() { }

    validarFiltrosDispositivos(filtros: any): { tipo: string, resumen: string, detalle: string } | null {
        if (!filtros.dispositivos || filtros.dispositivos.length === 0) {
            return {
                tipo: 'info',
                resumen: 'Selección de dispositivos',
                detalle: 'Debe seleccionar al menos un dispositivo para generar el reporte.'
            };
        }

        // Validación lógica adicional (por ejemplo, si seleccionó incluirExploit pero no vulnerabilidades)
        if (filtros.incluirExploit && !filtros.incluirVulnerabilidades) {
            return {
                tipo: 'info',
                resumen: 'Selección inválida',
                detalle: 'No se puede incluir la columna de exploits si no ha seleccionado vulnerabilidades.'
            };
        }

        if (filtros.incluirUrl && !filtros.incluirVulnerabilidades) {
            return {
                tipo: 'info',
                resumen: 'Selección inválida',
                detalle: 'No se puede incluir enlaces externos si no ha seleccionado vulnerabilidades.'
            };
        }

        return null;
    }

    validarFiltrosUsuarios(filtros: any): { tipo: string, resumen: string, detalle: string } | null {
        if (!filtros.usuario_ids || filtros.usuario_ids.length === 0) {
            return {
                tipo: 'info',
                resumen: 'Selección de usuarios',
                detalle: 'Debe seleccionar al menos un usuario para generar el reporte.'
            };
        }
        return null;
    }

    validarFiltrosRoles(filtros: any): { tipo: string, resumen: string, detalle: string } | null {
        if (!filtros.roles || filtros.roles.length === 0) {
            return {
                tipo: 'info',
                resumen: 'Selección de roles',
                detalle: 'Debe seleccionar al menos un rol para generar el reporte.'
            };
        }
        return null;
    }

    validarFiltrosConfiguraciones(filtros: any): { tipo: string, resumen: string, detalle: string } | null {
        if (!filtros.configuracion_ids || filtros.configuracion_ids.length === 0) {
            return {
                tipo: 'info',
                resumen: 'Selección de configuraciones',
                detalle: 'Debe seleccionar al menos una configuración para generar el reporte.'
            };
        }
        return null;
    }

    validarFiltrosGenerales(tipo: string, filtros: any): { tipo: string, resumen: string, detalle: string } | null {
        switch (tipo) {
            case 'dispositivos':
                return this.validarFiltrosDispositivos(filtros);
            case 'usuarios':
                return this.validarFiltrosUsuarios(filtros);
            case 'roles':
                return this.validarFiltrosRoles(filtros);
            case 'configuraciones':
                return this.validarFiltrosConfiguraciones(filtros);
            default:
                return { tipo: 'error', resumen: 'Error desconocido', detalle: 'Tipo de reporte no reconocido.' };
        }
    }
    validarDatosGuardado(nombre: string, descripcion: string, reportesExistentes: any[]): { tipo: string, resumen: string, detalle: string } | null {
        if (!nombre || nombre.trim().length === 0) {
            return {
                tipo: 'info',
                resumen: 'Campo obligatorio',
                detalle: 'Debe ingresar un nombre para el reporte.'
            };
        }

        const nombreExistente = reportesExistentes.some(r => r.nombre_reporte_generado.toLowerCase().trim() === nombre.toLowerCase().trim());
        if (nombreExistente) {
            return {
                tipo: 'warn',
                resumen: 'Nombre duplicado',
                detalle: 'Ya existe un reporte con ese nombre. Por favor, elija otro nombre.'
            };
        }

        if (!descripcion || descripcion.trim().length === 0) {
            return {
                tipo: 'info',
                resumen: 'Campo obligatorio',
                detalle: 'Debe ingresar una descripción para el reporte.'
            };
        }

        return null;
    }

}
