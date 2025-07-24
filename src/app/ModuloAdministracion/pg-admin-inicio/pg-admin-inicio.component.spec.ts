import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgAdminInicioComponent } from './pg-admin-inicio.component';

describe('PgAdminInicioComponent', () => {
  let component: PgAdminInicioComponent;
  let fixture: ComponentFixture<PgAdminInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgAdminInicioComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgAdminInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
