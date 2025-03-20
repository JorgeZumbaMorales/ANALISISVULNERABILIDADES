import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPrincipalConfiguracionComponent } from './pg-principal-configuracion.component';

describe('PgPrincipalConfiguracionComponent', () => {
  let component: PgPrincipalConfiguracionComponent;
  let fixture: ComponentFixture<PgPrincipalConfiguracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgPrincipalConfiguracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgPrincipalConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
