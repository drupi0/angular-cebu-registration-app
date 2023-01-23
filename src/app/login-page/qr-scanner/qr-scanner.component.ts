import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'ngx-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {

  @ViewChild("action") scanner?: NgxScannerQrcodeComponent;

  @Output("scannedData") scannedData: EventEmitter<string> = new EventEmitter();

  _destroy: Subject<boolean> = new Subject();



  constructor() { }

  ngAfterViewInit(): void {
    if(this.scanner) {
      this.scanner.data.pipe(takeUntil(this._destroy)).subscribe(data => {
        if(data.length) {
          this.scannedData.next(data[0].value);
          this.scanner?.stop();
        }
       
      });
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
    this._destroy.complete();
  }

}
