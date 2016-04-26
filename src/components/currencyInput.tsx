///<reference path="../project.d.ts"/>

import { FormControl, FormControlProps } from "react-bootstrap";
import * as Icon from "react-fa";

require("./currencyInput.css");


interface Props extends FormControlProps {
  locale: string;
}

export class CurrencyInput extends React.Component<Props, any> {
  render() {
    return (
      <FormControl
        {...this.props}
        type="number"
        {...{step: "any"}}
        className="currencyInput"
        addonBefore={<Icon name="dollar"/>}
      />
    );
  }
}
