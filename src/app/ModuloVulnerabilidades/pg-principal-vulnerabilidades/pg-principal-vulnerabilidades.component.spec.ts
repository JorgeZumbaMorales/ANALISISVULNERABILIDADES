import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPrincipalVulnerabilidadesComponent } from './pg-principal-vulnerabilidades.component';

describe('PgPrincipalVulnerabilidadesComponent', () => {
  let component: PgPrincipalVulnerabilidadesComponent;
  let fixture: ComponentFixture<PgPrincipalVulnerabilidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgPrincipalVulnerabilidadesComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgPrincipalVulnerabilidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
