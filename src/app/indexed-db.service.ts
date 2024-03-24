import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { Share } from '@capacitor/share';
@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbName: string = 'studentFormDB';
  private dbVersion: number = 1;
  private db: IDBDatabase | undefined;
  private studentFormSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = window.indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest<IDBDatabase>).result;
      if (result) {
        this.db = result;
        this.fetchData();
      } else {
        console.error('Failed to initialize IndexedDB.');
      }
    };

    request.onupgradeneeded = (event) => {
      const result = (event.target as IDBRequest<IDBDatabase>).result;
      if (result) {
        this.db = result;
        this.db.createObjectStore('studentForms', { keyPath: 'id', autoIncrement: true });
      } else {
        console.error('Failed to initialize IndexedDB.');
      }
    };
  }

  private fetchData() {
    if (this.db) {
      const transaction = this.db.transaction(['studentForms'], 'readonly');
      const objectStore = transaction.objectStore('studentForms');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const data = (event.target as IDBRequest).result;
        if (data) {
          this.studentFormSubject.next(data);
        }
      };
    } else {
      console.error('IndexedDB is not initialized.');
    }
  }

  saveStudentForm(studentForm: any) {
    if (this.db) {
      const transaction = this.db.transaction(['studentForms'], 'readwrite');
      const objectStore = transaction.objectStore('studentForms');
      const request = objectStore.add(studentForm);

      request.onsuccess = () => {
        this.fetchData();
      };
    } else {
      console.error('IndexedDB is not initialized.');
    }
  }
  updateStudentForm(record: any) {
    if (this.db) {
      const transaction = this.db.transaction(['studentForms'], 'readwrite');
      const objectStore = transaction.objectStore('studentForms');
      record.sync = true;
      objectStore.put(record);
    }
  }
  getStudentForms() {
    return this.studentFormSubject.asObservable();
  }
  generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    // Format the timestamp as desired, for example: YYYY-MM-DD HH:mm:ss
    const timestamp = `${year}-${month}-${day}_${hours}_${minutes}_${seconds}`;
    return timestamp;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  toStandardCase(str: string) {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  }
  exportToExcel() {
    this.getStudentForms().subscribe(async (forms: any[]) => {
      // Group forms by townName
      const towns: { [key: string]: any[] } = {};
      forms.forEach(form => {
        form.townName = this.toStandardCase(form.townName)
        if (!towns[form.townName]) {
          towns[form.townName] = [];
        }
        towns[form.townName].push(form);
      });

      // Create a new workbook
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();

      // Iterate over each town
      for (const townName in towns) {
        if (towns.hasOwnProperty(townName)) {
          const townForms = towns[townName];
          // Rearrange student data in the required order
          const formattedStudentData: any = [];
          townForms.forEach(form => {
            if (form.id)
              if (form.children.length > 1) {
                const parentInfo = {
                  'अ. क्र.': form.id,
                  'पालकांचे नाव': form.parentName,
                  'गावाचे नाव': form.townName,
                  'पालकांचा मोबाइल नंबर': form.parentMobile,
                  'विद्यार्थ्याचे नाव': form.children[0].studentName,
                  'मोबाइल नंबर': form.children[0].studentMobile,
                  'इयत्ता प्रवेश': form.children[0].standard,
                  'शेरा/नोंद': form.children[0].comments,
                  'प्रतिनिधीचे नाव': form.representativeName
                };
                form.children.splice(0, 1);
                const childrenInfo = form.children.map((child: any, key: number) => ({
                  'विद्यार्थ्याचे नाव': child.studentName,
                  'मोबाइल नंबर': child.studentMobile,
                  'इयत्ता प्रवेश': child.standard,
                  'शेरा/नोंद': child.comments,
                  'प्रतिनिधीचे नाव': form.representativeName
                }));
                formattedStudentData.push(parentInfo, ...childrenInfo);
              } else {
                const parentInfo = {
                  'अ. क्र.': form.id,
                  'पालकांचे नाव': form.parentName,
                  'गावाचे नाव': form.townName,
                  'पालकांचा मोबाइल नंबर': form.parentMobile,
                  'विद्यार्थ्याचे नाव': form?.children[0]?.studentName,
                  'मोबाइल नंबर': form?.children[0]?.studentMobile,
                  'इयत्ता प्रवेश': form?.children[0]?.standard,
                  'शाखा': form?.children[0]?.branch,
                  'शेरा/नोंद': form?.children[0]?.comments,
                  'प्रतिनिधीचे नाव': form.representativeName
                }
                formattedStudentData.push(parentInfo);
              }
          });

          // Create a new worksheet for the town
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedStudentData,
            {
              header: ['अ. क्र.', 'पालकांचे नाव', 'गावाचे नाव', 'पालकांचा मोबाइल नंबर', 'विद्यार्थ्याचे नाव', 'मोबाइल नंबर', 'इयत्ता प्रवेश', 'शाखा', 'शेरा/नोंद'],
            }
          );
          XLSX.utils.book_append_sheet(workbook, worksheet, townName);
        }
      }
      // Save Excel file
      const filename = `सर्वेक्षण_यादी-${this.generateTimestamp()}.xlsx`;
      XLSX.writeFile(workbook, filename);
      const wbout = await XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      if (!wbout || wbout.byteLength === 0) {
        console.error('No data to write to file');
        return;
      }

      try {
        const path = `${filename}`;
        const result = await Filesystem.writeFile({
          path,
          data: wbout,
          directory: Directory.Documents
        });
        this.shareFile(result.uri)
      } catch (error) {
        console.error('Error writing file', error);
      }
    });
  }



  private async shareFile(path: string): Promise<void> {
    try {
      const shareOptions = {
        title: 'Share File',
        text: 'Sharing file',
        files: [path],
        dialogTitle: 'Share via'
      };

      await Share.share(shareOptions);

      console.log('File shared successfully');
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  }





}
