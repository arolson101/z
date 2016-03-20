///<reference path="../project.d.ts"/>

import { connect } from "react-redux";
import { Row, Grid, Panel } from "react-bootstrap";
import * as Icon from "react-fa";

import { AccountGroup, accountGroups, StatelessComponent, Link, LinkButton } from "../components";
import { AppState } from "../state";
import { Account } from "../types";
import { t } from "../i18n";

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
              <h3>
                <Icon name="university" />
                {group.institution.name}
                <Link to={`/accounts/edit/${group.institution.dbid}`} className="pull-right">
                  <Icon name="edit"/>
                </Link>
              </h3>
            }
          >
            <ul>
            {_.map(group.accounts, (account: Account) =>
                <li key={account.dbid}><Link to={`/accounts/${account.dbid}`}>{account.name}</Link></li>
            )}
            </ul>
          </Panel>
        )}
      </Row>
      <Row>
        <LinkButton to="/accounts/new">
          <Icon name="plus"/>
          {t(" ")}
          {t("AccountsPage.add")}
        </LinkButton>
      </Row>
    </Grid>;
  }
}
