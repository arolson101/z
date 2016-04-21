///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import ReactDOM = require("react-dom");
import d3 = require("d3");
const nvd3: nv.Nvd3Static = require("nvd3");
require("nvd3/build/nv.d3.css");

import { formatCurrency } from "../i18n";


export interface CurrencyChartPoint {
  date: Date;
  value: number;
}

export interface CurrencyChartDataset {
  values: CurrencyChartPoint[];
  key?: string;
  color?: string;
}


export interface Props {
  height?: number;
  datasets: CurrencyChartDataset[];
}


export class CurrencyChart extends React.Component<Props, any> {
  chart: nv.LineChart;

  render() {
    return <svg ref="svg" height={this.props.height}/>;
  }

  componentDidMount() {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    this.props.datasets.forEach((dataset) => {
      dataset.values.forEach((value) => {
        min = Math.min(min, value.value);
        max = Math.max(max, value.value);
      });
    });

    const pad = (max - min) * 0.25;
    min = Math.min(min - pad, 0);
    max = Math.max(max + pad, 0);

    this.chart = nvd3.models.lineChart()
      .x((d: CurrencyChartPoint) => d.date)
      .y((d: CurrencyChartPoint) => d.value)
      .xScale(d3.time.scale())
      .forceY([min, max])
      //.margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
      //.useInteractiveGuideline(true)
      //.transitionDuration(350)
      .showLegend(true)
      .showYAxis(true)
      .showXAxis(true)
    ;

    this.chart.xAxis
      .showMaxMin(false)
      .tickFormat(d3.time.format("%b %-d"));

    this.chart.yAxis
      .showMaxMin(false)
      .tickFormat(formatCurrency);

    let svg = ReactDOM.findDOMNode(this.refs["svg"]);
    d3.select(svg)
        .datum(this.props.datasets)
        .call(this.chart);

    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    let svg = ReactDOM.findDOMNode(this.refs["svg"]);
    d3.select(svg).remove();
    window.removeEventListener("resize", this.handleResize);
  }

  @autobind
  handleResize() {
    this.chart.update();
  }
}
