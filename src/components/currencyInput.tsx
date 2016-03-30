///<reference path="../project.d.ts"/>

import { Input, InputProps } from "react-bootstrap";


interface Props extends InputProps {
  locale: string;
}


export class CurrencyInput extends React.Component<Props, any> {
  render() {
    return (
      <Input type="number" {...this.props} />
    );
  }
}
