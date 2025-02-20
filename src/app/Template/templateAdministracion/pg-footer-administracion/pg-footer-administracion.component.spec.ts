import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgFooterAdministracionComponent } from './pg-footer-administracion.component';

describe('PgFooterAdministracionComponent', () => {
  let component: PgFooterAdministracionComponent;
  let fixture: ComponentFixture<PgFooterAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgFooterAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgFooterAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
