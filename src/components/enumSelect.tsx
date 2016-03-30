///<reference path="../project.d.ts"/>

import { Input, InputProps } from "react-bootstrap";
import { EnumEx, EnumType } from "../util";



interface Props extends InputProps {
  enum: EnumType;
}


export class EnumSelect extends React.Component<Props, any> {
  render() {
    return <Input type="select" {...this.props as any}>
      {EnumEx.map(this.props.enum, (name: string, value: number) =>
        <option key={value} value={value as any}>{this.props.enum.tr(name)}</option>
      )}
    </Input>;
  }
}
