import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgFooterPublicoComponent } from './pg-footer-publico.component';

describe('PgFooterPublicoComponent', () => {
  let component: PgFooterPublicoComponent;
  let fixture: ComponentFixture<PgFooterPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgFooterPublicoComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgFooterPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
