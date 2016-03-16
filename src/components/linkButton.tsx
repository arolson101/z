 /// <reference path="../project.d.ts"/>

import { Button, ButtonProps } from "react-bootstrap";
import { hashHistory as history, Link } from "react-router";

export { Link, history }

interface Props extends ButtonProps {
  to: string;
  query?: Object;
}

export class LinkButton extends React.Component<Props, any> {
  render() {
    return <Button
      {...this.props}
      href={history.createHref(this.props.to, this.props.query)}
    >
      {this.props.children}
    </Button>;
  }
}
