import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoPlantasPage } from './info-plantas.page';

describe('InfoPlantasPage', () => {
  let component: InfoPlantasPage;
  let fixture: ComponentFixture<InfoPlantasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPlantasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
