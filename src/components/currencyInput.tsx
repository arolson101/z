///<reference path="../project.d.ts"/>

import { Input, InputProps } from "react-bootstrap";
import * as Icon from "react-fa";

import { StatelessComponent } from "./component";

require("./currencyInput.css");


interface Props extends InputProps {
  locale: string;
}

export class CurrencyInput extends StatelessComponent<Props> {
  render() {
    return (
      <Input
        {...this.props}
        type="number"
        {...{step: "any"}}
        className="currencyInput"
        addonBefore={<Icon name="dollar"/>}
      />
    );
  }
}
