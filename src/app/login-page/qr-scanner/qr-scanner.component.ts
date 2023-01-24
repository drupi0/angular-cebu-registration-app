import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgxScannerQrcodeComponent, ScannerQRCodeConfig, ScannerQRCodeDevice } from 'ngx-scanner-qrcode';
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

  foundDevices: ScannerQRCodeDevice[] = [];
  cameraEnabled: number = 0;

  scannerConfig: ScannerQRCodeConfig = {
    medias: {
      video: {
        advanced: [{
          facingMode: { ideal: 'environment' },
          height:  300,
          width: 300,
        }]
      }
    }
  }


  constructor() { }

  turnOnOff() {
    if(this.scanner?.isStart) {
      this.scanner.stop();
      return;
    }

    this.scanner?.start();
  }

  switchCamera() {
    if(this.foundDevices.length && this.scanner) {
      if(this.cameraEnabled >= this.foundDevices.length - 1) {
        this.cameraEnabled = 0;
      } else {
        this.cameraEnabled += 1;
      }

      this.scanner?.playDevice(this.foundDevices[this.cameraEnabled].deviceId);
    }
  }

  ngAfterViewInit(): void {
    if(this.scanner) {

      this.scanner.devices.asObservable().pipe(takeUntil(this._destroy)).subscribe((device : ScannerQRCodeDevice[]) => {
        if(device.length) {
          this.scanner?.playDevice(device[0].deviceId);
          this.foundDevices = device;
          this.cameraEnabled = 0;
        }
      })
      

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
