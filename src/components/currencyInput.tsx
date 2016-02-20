///<reference path="../project.d.ts"/>

import { StatelessComponent } from "./component";
import { Input, InputProps } from "react-bootstrap";


interface Props extends InputProps {
  locale: string;
}


export class CurrencyInput extends StatelessComponent<Props> {
  render() {
    return (
      <Input type="number" {...this.props} />
    );
  }
}
