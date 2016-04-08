 /// <reference path="../project.d.ts"/>

import { createClass as createChart } from "react-chartjs";
require("chart.js-scatter");

// see http://dima117.github.io/Chart.Scatter/

export interface ScatterPoint {
  x: number | Date;
  y: number;
  r?: number;
}

export interface ScatterChartDataSet {
  label: string;
  fillColor?: string;
  strokeColor: string;

  pointColor?: string;
  pointStrokeColor?: string;
  pointHighlightFill?: string;
  pointHighlightStroke?: string;

  data: ScatterPoint[];
}

export interface ScatterChartData {
  labels: string[];
  datasets: ScatterChartDataSet[];
}

export interface ScatterChartOptions extends ChartOptions {
  // SUPPORTED GLOBAL OPTIONS

  // Boolean - If we should show the scale at all
  showScale?: boolean;

  // String - Colour of the scale line
  scaleLineColor?: string;

  // Number - Pixel width of the scale line
  scaleLineWidth?: number;

  // Boolean - Whether to show labels on the scale
  scaleShowLabels?: boolean;

  // Interpolated JS string - can access value
  scaleLabel?: string;

  // Interpolated JS string - can access value
  scaleArgLabel?: string;

  // String - Message for empty data
  emptyDataMessage?: string;

  // GRID LINES

  // Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines?: boolean;

  // Number - Width of the grid lines
  scaleGridLineWidth?: number;

  // String - Colour of the grid lines
  scaleGridLineColor?: string;

  // Boolean - Whether to show horizontal lines (except X axis)	
  scaleShowHorizontalLines?: boolean;

  // Boolean - Whether to show vertical lines (except Y axis)
  scaleShowVerticalLines?: boolean;

  // HORIZONTAL SCALE RANGE

  // Boolean - If we want to override with a hard coded x scale
  xScaleOverride?: boolean;

  // ** Required if scaleOverride is true **
  // Number - The number of steps in a hard coded x scale
  xScaleSteps?: number;

  // Number - The value jump in the hard coded x scale
  xScaleStepWidth?: number;

  // Number - The x scale starting value
  xScaleStartValue?: number | Date;

  // VERTICAL SCALE RANGE

  // Boolean - If we want to override with a hard coded y scale
  scaleOverride?: boolean;

  // ** Required if scaleOverride is true **
  // Number - The number of steps in a hard coded y scale
  scaleSteps?: number;

  // Number - The value jump in the hard coded y scale
  scaleStepWidth?: number;

  // Number - The y scale starting value
  scaleStartValue?: number;

  // DATE SCALE

  // String - scale type: "number" or "date"
  scaleType?: string; // "number" | "date";

  // Boolean - Whether to use UTC dates instead local
  useUtc?: boolean;

  // String - short date format (used for scale labels)
  scaleDateFormat?: string;

  // String - short time format (used for scale labels)
  scaleTimeFormat?: string;

  // String - full date format (used for point labels)
  scaleDateTimeFormat?: string;

  // LINES

  // Boolean - Whether to show a stroke for datasets
  datasetStroke?: boolean;

  // Number - Pixel width of dataset stroke
  datasetStrokeWidth?: number;

  // String - Color of dataset stroke
  datasetStrokeColor?: string;

  // String - Color of dataset stroke
  datasetPointStrokeColor?: string;

  // Boolean - Whether the line is curved between points
  bezierCurve?: boolean;

  // Number - Tension of the bezier curve between points
  bezierCurveTension?: number;

  // POINTS

  // Boolean - Whether to show a dot for each point
  pointDot?: boolean;

  // Number - Pixel width of point dot stroke
  pointDotStrokeWidth?: number;

  // Number - Radius of each point dot in pixels
  pointDotRadius?: number;

  // Number - amount extra to add to the radius to cater for hit detection outside the drawn point
  pointHitDetectionRadius?: number;

  // TEMPLATES

  // Interpolated JS string - can access point fields: 
  // argLabel, valueLabel, arg, value, datasetLabel, size
  tooltipTemplate?: string;

  // Interpolated JS string - can access point fields: 
  // argLabel, valueLabel, arg, value, datasetLabel, size
  multiTooltipTemplate?: string;

  // Interpolated JS string - can access all chart fields
  legendTemplate?: string;
}

export interface ScatterChartProps extends React.HTMLProps<HTMLCanvasElement> {
  data: HTMLCanvasElement | any; // conflicts with react's HTMLAttributes
  options: ScatterChartOptions;
  redraw?: boolean;
}

export const ScatterChart = createChart<ScatterChartProps>("Scatter", ["removeData"], "points");


// // fix
// let chartjs = require("chart.js");
// let scatter = chartjs.types["Scatter"];
// scatter.prototype.removeData = function() {
//   this.datasets.forEach((dataset: any) => {
//     dataset.removePoint(0);
//   });

//   // var dataRange = this._calculateRange();
//   // this.scale.setDataRange(dataRange);

//   this.scale.calculateXscaleRange();
//   this.scale.generateXLabels();
//   this.update();
// };
