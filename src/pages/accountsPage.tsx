///<reference path="../project.d.ts"/>

import { connect } from "react-redux";
import { Row, Grid, Panel } from "react-bootstrap";
import * as Icon from "react-fa";

import { AccountGroup, accountGroups, StatelessComponent } from "../components";
import { AppState } from "../state";
import { Account } from "../types";

interface Props {
  accountGroups: AccountGroup[];
}

@connect(
  (state: AppState) => ({accountGroups: accountGroups(state)})
)
export class AccountsPage extends StatelessComponent<Props> {
  render() {
    return <Grid>
      <Row>
        {_.map(this.props.accountGroups, (group: AccountGroup) =>
          <Panel
            key={group.institution.dbid}
            header={
              <h3><Icon name="university" /> {group.institution.name}</h3>
            }
          >
            <ul>
            {_.map(group.accounts, (account: Account) =>
                <li key={account.dbid}>{account.name}</li>
            )}
            </ul>
          </Panel>
        )}
      </Row>
    </Grid>;
  }
}
