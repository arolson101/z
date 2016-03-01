///<reference path="../project.d.ts"/>

import { StatelessComponent } from "./component";

require("./dateIcon.css");

interface Props {
  date: Date;
  style?: __React.CSSProperties;
}

export class DateIcon extends StatelessComponent<Props> {
  render() {
    const timeprops = { datetime: this.props.date.toUTCString() };
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.props.date.getDay()];
    const date = this.props.date.getDay();
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][this.props.date.getMonth()];
    return <time {...timeprops} className="icon">
      <em>{weekday}</em>
      <strong>{month}</strong>
      <span>{date}</span>
    </time>;

    // return <div className="fa-2x dateIcon-stack" {...this.props}>
    //   <i className="fa fa-calendar-o"/>
    //   <span className="dateIcon-day">
    //     {this.props.day}
    //   </span>
    // </div>;
  }
}
