import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IndexedDbService } from '../indexed-db.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  studentForms: any[] = [];
  constructor(private router: Router, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.indexedDbService.getStudentForms().subscribe(forms => {
      this.studentForms = forms;
    })
  }
  logout() {
    this.router.navigateByUrl('/home');
  }
  exportToExel(){
    this.indexedDbService.exportToExcel()
  }
}
