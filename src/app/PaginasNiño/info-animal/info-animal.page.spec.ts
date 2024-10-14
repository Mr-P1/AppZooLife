import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoAnimalPage } from './info-animal.page';

describe('InfoAnimalPage', () => {
  let component: InfoAnimalPage;
  let fixture: ComponentFixture<InfoAnimalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoAnimalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
