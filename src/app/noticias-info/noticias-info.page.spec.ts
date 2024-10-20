import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticiasInfoPage } from './noticias-info.page';

describe('NoticiasInfoPage', () => {
  let component: NoticiasInfoPage;
  let fixture: ComponentFixture<NoticiasInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticiasInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
