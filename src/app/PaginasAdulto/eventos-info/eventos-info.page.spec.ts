import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventosInfoPage } from './eventos-info.page';

describe('EventosInfoPage', () => {
  let component: EventosInfoPage;
  let fixture: ComponentFixture<EventosInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
