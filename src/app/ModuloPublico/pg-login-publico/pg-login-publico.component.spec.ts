import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgLoginPublicoComponent } from './pg-login-publico.component';

describe('PgLoginPublicoComponent', () => {
  let component: PgLoginPublicoComponent;
  let fixture: ComponentFixture<PgLoginPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgLoginPublicoComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgLoginPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
