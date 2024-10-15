import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantaInfoPage } from './planta-info.page';

describe('PlantaInfoPage', () => {
  let component: PlantaInfoPage;
  let fixture: ComponentFixture<PlantaInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantaInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
