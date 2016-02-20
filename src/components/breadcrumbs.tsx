///<reference path="../project.d.ts"/>

import { StatelessComponent } from "./component";
import { Link } from "react-router";


interface Props {
  items: {
    href?: string;
    title: string;
  }[];
}


export class Breadcrumbs extends StatelessComponent<Props> {
  render() {
    return (
      <ol className="breadcrumb">
        {
          this.props.items.map(item =>
            <li key={item.title}>
              {item.href
                ? <Link to={item.href}>{item.title}</Link>
                : item.title
              }
            </li>
          )
        }
      </ol>
    );
  }
}
