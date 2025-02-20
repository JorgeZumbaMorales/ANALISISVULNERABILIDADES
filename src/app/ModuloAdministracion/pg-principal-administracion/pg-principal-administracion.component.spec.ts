import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPrincipalAdministracionComponent } from './pg-principal-administracion.component';

describe('PgPrincipalAdministracionComponent', () => {
  let component: PgPrincipalAdministracionComponent;
  let fixture: ComponentFixture<PgPrincipalAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgPrincipalAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgPrincipalAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
