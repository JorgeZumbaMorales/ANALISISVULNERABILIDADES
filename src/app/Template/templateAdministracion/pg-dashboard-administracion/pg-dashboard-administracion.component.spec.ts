import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDashboardAdministracionComponent } from './pg-dashboard-administracion.component';

describe('PgDashboardAdministracionComponent', () => {
  let component: PgDashboardAdministracionComponent;
  let fixture: ComponentFixture<PgDashboardAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgDashboardAdministracionComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgDashboardAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
