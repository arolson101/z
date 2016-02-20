///<reference path="../project.d.ts"/>

// import { connect } from "react-redux";
// import { AppState } from "../state";
import { StatelessComponent } from "../components";


export class LoginPage extends StatelessComponent<any> {
  render() {
    return <div>login page</div>;
  }
}



export class AppLoginPage extends StatelessComponent<any> {
  render() {
    return <LoginPage/>;
  }
}
