import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgUsuariosComponent } from './pg-usuarios.component';

describe('PgUsuariosComponent', () => {
  let component: PgUsuariosComponent;
  let fixture: ComponentFixture<PgUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
