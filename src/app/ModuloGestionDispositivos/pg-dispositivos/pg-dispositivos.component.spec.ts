import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDispositivosComponent } from './pg-dispositivos.component';

describe('PgDispositivosComponent', () => {
  let component: PgDispositivosComponent;
  let fixture: ComponentFixture<PgDispositivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgDispositivosComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgDispositivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
