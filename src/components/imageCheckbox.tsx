///<reference path="../project.d.ts"/>

import { Button } from "react-bootstrap";
import * as Icon from "react-fa";
import { autobind } from "core-decorators";
import { StatelessComponent } from "./component";

interface Props {
  on: string;
  off: string;
  value: any;
  onChange: (value: any) => any;
}

export class ImageCheckbox extends StatelessComponent<Props> {
  render() {
    const { on, off, value } = this.props;
    return <Button
      type="button"
      bsStyle="link"
      onClick={this.onClick}
      >
      <Icon name={value ? on : off}/>
    </Button>;
  }

  @autobind
  onClick() {
    if (this.props.onChange) {
      this.props.onChange(!this.props.value);
    }
  }
}
