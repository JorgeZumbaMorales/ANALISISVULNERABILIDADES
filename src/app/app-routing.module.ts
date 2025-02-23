import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importar los componentes principales
import { PgInicioPortadaComponent } from './Template/pg-inicio-portada/pg-inicio-portada.component';
import { PgDashboardAdministracionComponent } from './Template/templateAdministracion/pg-dashboard-administracion/pg-dashboard-administracion.component';
import { PgLoginPublicoComponent } from './ModuloPublico/pg-login-publico/pg-login-publico.component';
import { PgPrincipalAdministracionComponent } from './ModuloAdministracion/pg-principal-administracion/pg-principal-administracion.component';
import { PgAdminInicioComponent } from './ModuloAdministracion/pg-admin-inicio/pg-admin-inicio.component';
import { PgUsuariosComponent } from './ModuloAdministracion/pg-usuarios/pg-usuarios.component';
import { PgRolesComponent } from './ModuloAdministracion/pg-roles/pg-roles.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/public', 
    pathMatch: 'full' 
  },
  { 
    path: 'public', 
    component: PgInicioPortadaComponent 
  },
  { 
    path: 'public/login', 
    component: PgLoginPublicoComponent 
  },
  { 
    path: 'admin',
    component: PgDashboardAdministracionComponent, // 📌 Contenedor Principal
    children: [
      { path: 'inicio', component: PgAdminInicioComponent }, // 📌 Pantalla de Inicio en Admin

      // 📌 Sección "Accesos" que contiene los Tabs de Usuarios y Roles
      { 
        path: 'accesos',
        component: PgPrincipalAdministracionComponent,
        children: [
          { path: 'usuarios', component: PgUsuariosComponent },
          { path: 'roles', component: PgRolesComponent },
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' } // 📌 Redirigir a Usuarios si no se especifica
        ]
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '/public' // 📌 Redirigir a la página pública si la ruta no existe
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
