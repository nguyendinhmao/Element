export const ChartType = {
  PROJECT_COMPLETION: 'PROJECT_COMPLETION',
  TOTAL_CHANGES: 'TOTAL_CHANGES',
  TOTAL_HANDOVERS: 'TOTAL_HANDOVERS',
  TOTAL_PUNCH_ITEMS: 'TOTAL_PUNCH_ITEMS',
  TOTAL_ITRS: 'TOTAL_ITRS',
  WEEKLY_ITRS: 'WEEKLY_ITRS',
  WEEKLY_PUNCH_ITEMS: 'WEEKLY_PUNCH_ITEMS',
  WEEKLY_HANDOVERS: 'WEEKLY_HANDOVERS',
};

export class ChartModel {
  chartId: string;
  chartCode: string;
  chartName: string;
  show: boolean;
  order: any;
  number?: number;
}

export class ChartCommand {
  projectKey: string;
  dashboardCharts: ChartModel[];
}
