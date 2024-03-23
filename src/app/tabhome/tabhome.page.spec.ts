import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabhomePage } from './tabhome.page';

describe('TabhomePage', () => {
  let component: TabhomePage;
  let fixture: ComponentFixture<TabhomePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TabhomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
