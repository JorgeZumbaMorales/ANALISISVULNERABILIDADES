import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VulnerabilidadesCveComponent } from './vulnerabilidades-cve.component';

describe('VulnerabilidadesCveComponent', () => {
  let component: VulnerabilidadesCveComponent;
  let fixture: ComponentFixture<VulnerabilidadesCveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VulnerabilidadesCveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VulnerabilidadesCveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
