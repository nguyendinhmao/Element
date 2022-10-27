import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartType } from 'src/app/shared/models/dashboard/dashboard.model';

@Component({
    selector: 'chart-store',
    styleUrls: ['./chart-store.component.scss'],
    templateUrl: './chart-store.component.html'
})

export class ChartStoreComponent implements OnChanges, OnInit, AfterViewInit {
    @Input() type: string = null;
    @Input() data: any = null;
    @Input() sizeGauge: number = 200;

    heightTable: boolean;

    gaugeConfig = {
        type: 'arch',
        appendText: '%',
        thick: 23,
        cap: 'round',
        size: this.sizeGauge,
        label: 'Completion',
    };
    gaugeValue = null;

    planedColors = {
        complete: 'rgba(173, 255, 175, 0.5)',
        overdue: 'rgba(242, 46, 24, 0.5)',
        extra: 'rgba(250, 205, 2, 0.5)',
    };

    displayedColumns: string[] = [
        'handoverNo',
        'systemNo',
        'subSystemNo',
        'description',
        'plannedDate',
    ];

    chartType = ChartType;

    constructor() {}

    ngAfterViewInit(): void {
        if (this.type === this.chartType.WEEKLY_HANDOVERS) {
            this.heightTable = true;
        }
    }

    ngOnInit() {

    }

    ngOnChanges(): void {
        this.gaugeConfig.size = this.sizeGauge;
    }

    convertDate(date: string) {
        return (new Date(date)).toLocaleString('en-US', { month: 'short', day: '2-digit' });
    }
}
