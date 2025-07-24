import { Routes } from '@angular/router';
import { AuthGuard } from './Seguridad/auth.guard';
import { ConfirmDeactivateGuard } from './Seguridad/confirm-deactivate.guard';

// Componentes públicos
import { PgInicioPortadaComponent } from './Template/pg-inicio-portada/pg-inicio-portada.component';
import { PgLoginPublicoComponent } from './ModuloPublico/pg-login-publico/pg-login-publico.component';

// Dashboard principal
import { PgDashboardAdministracionComponent } from './Template/templateAdministracion/pg-dashboard-administracion/pg-dashboard-administracion.component';

// Administración
import { PgPrincipalAdministracionComponent } from './ModuloAdministracion/pg-principal-administracion/pg-principal-administracion.component';
import { PgAdminInicioComponent } from './ModuloAdministracion/pg-admin-inicio/pg-admin-inicio.component';
import { PgUsuariosComponent } from './ModuloAdministracion/pg-usuarios/pg-usuarios.component';
import { PgRolesComponent } from './ModuloAdministracion/pg-roles/pg-roles.component';

// Gestión de dispositivos
import { PgPrincipalGestionDispositivosComponent } from './ModuloGestionDispositivos/pg-principal-gestion-dispositivos/pg-principal-gestion-dispositivos.component';
import { PgDispositivosComponent } from './ModuloGestionDispositivos/pg-dispositivos/pg-dispositivos.component';
import { PgHistorialDispositivosComponent } from './ModuloGestionDispositivos/pg-historial-dispositivos/pg-historial-dispositivos.component';

// Vulnerabilidades
import { PgPrincipalVulnerabilidadesComponent } from './ModuloVulnerabilidades/pg-principal-vulnerabilidades/pg-principal-vulnerabilidades.component';
import { PgDispositivosVulnerablesComponent } from './ModuloVulnerabilidades/pg-dispositivos-vulnerables/pg-dispositivos-vulnerables.component';
import { VulnerabilidadesCveComponent } from './ModuloVulnerabilidades/vulnerabilidades-cve/vulnerabilidades-cve.component';

// Configuración
import { PgPrincipalConfiguracionComponent } from './ModuloConfiguracion/pg-principal-configuracion/pg-principal-configuracion.component';
import { PgConfiguracionEscaneosComponent } from './ModuloConfiguracion/pg-configuracion-escaneos/pg-configuracion-escaneos.component';

// Reportes
import { PgPrincipalReportesComponent } from './ModuloReportes/pg-principal-reportes/pg-principal-reportes.component';
import { PgReportesDocumentosComponent } from './ModuloReportes/pg-reportes-documentos/pg-reportes-documentos.component';
import { PgDashboardVisualComponent } from './ModuloReportes/pg-dashboard-visual/pg-dashboard-visual.component';

export const routes: Routes = [
  { path: '', redirectTo: '/public', pathMatch: 'full' },
  { path: 'public', component: PgInicioPortadaComponent },
  { path: 'public/login', component: PgLoginPublicoComponent },

  {
    path: 'admin',
    component: PgDashboardAdministracionComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'inicio', component: PgAdminInicioComponent },

      {
        path: 'accesos',
        component: PgPrincipalAdministracionComponent,
        children: [
          { path: 'usuarios', component: PgUsuariosComponent },
          { path: 'roles', component: PgRolesComponent },
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
      },

      {
        path: 'gestion',
        component: PgPrincipalGestionDispositivosComponent,
        children: [
          {
            path: 'dispositivos',
            component: PgDispositivosComponent,
            canDeactivate: [ConfirmDeactivateGuard]
          },
          {
            path: 'historial',
            component: PgHistorialDispositivosComponent,

          },
          { path: '', redirectTo: 'dispositivos', pathMatch: 'full' }
        ]
      },

      {
        path: 'vulnerabilidades',
        component: PgPrincipalVulnerabilidadesComponent,
        children: [
          {
            path: 'dispositivos-vulnerables',
            component: PgDispositivosVulnerablesComponent,
            canDeactivate: [ConfirmDeactivateGuard]

          },
          {
            path: 'cve', component: VulnerabilidadesCveComponent,
            canDeactivate: [ConfirmDeactivateGuard]

          },
          { path: '', redirectTo: 'dispositivos-vulnerables', pathMatch: 'full' }
        ]
      },

      {
        path: 'configuraciones',
        component: PgPrincipalConfiguracionComponent,
        children: [
          { path: 'escaneos', component: PgConfiguracionEscaneosComponent },
          { path: '', redirectTo: 'escaneos', pathMatch: 'full' }
        ]
      },

      {
        path: 'reportes',
        component: PgPrincipalReportesComponent,
        children: [
          { path: 'dashboard-visual', component: PgDashboardVisualComponent },
          { path: 'documentos', component: PgReportesDocumentosComponent },
          { path: '', redirectTo: 'dashboard-visual', pathMatch: 'full' }
        ]
      }
    ]
  },

  { path: '**', redirectTo: '/public' }
];
