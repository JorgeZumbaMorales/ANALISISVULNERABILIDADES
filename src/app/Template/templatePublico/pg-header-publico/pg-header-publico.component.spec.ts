import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgHeaderPublicoComponent } from './pg-header-publico.component';

describe('PgHeaderPublicoComponent', () => {
  let component: PgHeaderPublicoComponent;
  let fixture: ComponentFixture<PgHeaderPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgHeaderPublicoComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgHeaderPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
