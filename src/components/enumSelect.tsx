///<reference path="../project.d.ts"/>

import { Input, InputProps } from "react-bootstrap";
import { StatelessComponent } from "./component";
import { EnumEx, EnumType } from "../util";



interface Props extends InputProps {
  enum: EnumType;
}


export class EnumSelect extends StatelessComponent<Props> {
  render() {
    return <Input type="select" {...this.props}>
      {EnumEx.map(this.props.enum, (name: string, value: number) =>
        <option key={value} value={value as any}>{this.props.enum.tr(name)}</option>
      )}
    </Input>;
  }
}
