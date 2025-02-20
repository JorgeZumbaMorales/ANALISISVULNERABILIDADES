import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgHeaderAdministracionComponent } from './pg-header-administracion.component';

describe('PgHeaderAdministracionComponent', () => {
  let component: PgHeaderAdministracionComponent;
  let fixture: ComponentFixture<PgHeaderAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgHeaderAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgHeaderAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
