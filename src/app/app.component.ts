import {Component, ViewChild} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import { of as observableOf, catchError, switchMap, debounceTime, map} from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  displayedColumns: string[] = ['id', 'image', 'name', 'gender', 'status', 'species'];
  genders: any[] = [
    {value: '', viewValue: 'none'},
    {value: 'male', viewValue: 'male'},
    {value: 'female', viewValue: 'female'},
    {value: 'genderless', viewValue: 'genderless'},
    {value: 'unknown', viewValue: 'unknown'}
  ];
  statuses: any[] = [
    {value: '', viewValue: 'none'},
    {value: 'alive', viewValue: 'alive'},
    {value: 'dead', viewValue: 'dead'},
    {value: 'unknown', viewValue: 'unknown'},
  ];
  data: any[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isPaginationDisabled = false;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  genderSelect = new FormControl(this.genders[0].value);
  statusSelect = new FormControl(this.statuses[0].value);
  nameSearch = new FormControl('');
  form = new FormGroup({
    name: this.nameSearch,
    gender: this.genderSelect,
    status: this.statusSelect,
  });
  
  constructor(public apiService: ApiService){}

  // v2, with spin during debounce
  ngAfterViewInit() {
    this.apiService.getCharacters().subscribe((response) => {
      this.isLoadingResults = false;
      this.data = response.results;
      this.resultsLength = response.info.count;
    })
    this.form.valueChanges
      .pipe(
        switchMap(() => {
          this.isLoadingResults = true;
          this.isPaginationDisabled = true;
          this.paginator.pageIndex = 0;
          return observableOf(null);
        }),
        debounceTime(2000),
        switchMap(() => {
          return this.apiService.getCharacters(
            this.paginator.pageIndex + 1,
            this.nameSearch.value,
            this.genderSelect.value,
            this.statusSelect.value,
          ).pipe(
            catchError(() => observableOf(null)),
          )
        }),
        map((response) => {
          this.isLoadingResults = false;
          this.isPaginationDisabled = false;
          if (response === null) { 
            this.resultsLength = 0;
            this.data = [];
          } else {
            this.resultsLength = response.info.count;
            this.data = response.results;
          }
        })
      ) 
      .subscribe();
    this.paginator.page
      .pipe(
        switchMap(() => {
          this.isLoadingResults = true;
          return observableOf(null);
        }),
        debounceTime(2000),
        switchMap(() => {
          return this.apiService.getCharacters(
            this.paginator.pageIndex + 1,
            this.nameSearch.value,
            this.genderSelect.value,
            this.statusSelect.value,
          ).pipe(
            catchError(() => observableOf(null)),
          )
        }),
        map((response) => {
          this.isLoadingResults = false;
          if (response === null) { 
            this.resultsLength = 0;
            this.data = [];
          } else {
            this.resultsLength = response.info.count;
            this.data = response.results;
          }
        })
      )
      .subscribe()
  }
}
