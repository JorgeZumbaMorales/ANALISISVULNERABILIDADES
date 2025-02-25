import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPrincipalGestionDispositivosComponent } from './pg-principal-gestion-dispositivos.component';

describe('PgPrincipalGestionDispositivosComponent', () => {
  let component: PgPrincipalGestionDispositivosComponent;
  let fixture: ComponentFixture<PgPrincipalGestionDispositivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgPrincipalGestionDispositivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgPrincipalGestionDispositivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
