import { Injectable, OnInit } from '@angular/core';
import { StudentTable } from './student-table';
import { StudentRecord } from './student-record';
import { Btrieve } from 'cordova-plugin-actian-zen-core/www';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StudentService implements OnInit {

  private table: Promise<StudentTable>;

  constructor(private platform: Platform) {
    this.table = this.platform.ready().then(() => StudentTable.table());
  }

  ngOnInit() {
    this.table.then((table: StudentTable) => {
      // tslint:disable-next-line: forin
      for(let s in table) {
        console.log(s);
      }
    });
  }

  saveStudent(student: StudentRecord): Promise<StudentRecord> {
    if(student.studentId) {
      // @todo Update
    } else {
      return this.table.then((table: StudentTable) => table.insert(student));
    }
  }

  fetchStudentById(id: number): Promise<StudentRecord> {
    return this.table.then((table: StudentTable) => table.findByStudentId(id));
  }

  fetchStudentList(offset: number = 0, limit: number = Infinity): Promise<Array<StudentRecord>> {
    return this.table.then((table: StudentTable) => table.list(Btrieve.Index.INDEX_1, offset, limit));
  }

  deleteStudentById(id: number): Promise<boolean> {
    return this.table
      .then((table: StudentTable) => table.deleteByStudentId(id))
      .then((status: Btrieve.StatusCode) => status === Btrieve.StatusCode.STATUS_CODE_NO_ERROR);
  }

}
