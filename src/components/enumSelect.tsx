///<reference path="../project.d.ts"/>

import { FormControl, FormControlProps } from "react-bootstrap";
import { EnumEx, EnumType } from "../util";



interface Props extends FormControlProps {
  enum: EnumType;
}


export class EnumSelect extends React.Component<Props, any> {
  render() {
    return <FormControl componentClass="select" {...this.props}>
      {EnumEx.map(this.props.enum, (name: string, value: number) =>
        <option key={value} value={value}>{this.props.enum.tr(name)}</option>
      )}
    </FormControl>;
  }
}
