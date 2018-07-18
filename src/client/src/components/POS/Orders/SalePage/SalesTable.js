import React from "react";
import { Table } from 'semantic-ui-react';
import "./styles.css";
import SalesList from "./SalesList";


class SalesTable extends React.Component{
    render(){
        return(
          <div>
            <Table basic="very" celled selectable striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell singleLine>reference code</Table.HeaderCell>
                <Table.HeaderCell>client</Table.HeaderCell>
                <Table.HeaderCell>buyer</Table.HeaderCell>
                <Table.HeaderCell>created-by</Table.HeaderCell>
                <Table.HeaderCell>time</Table.HeaderCell>
                <Table.HeaderCell>status</Table.HeaderCell>
                <Table.HeaderCell>payment</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
              <SalesList orders={this.props.sales}/>
          </Table>
          </div>
        )
    }
}


export default SalesTable;
