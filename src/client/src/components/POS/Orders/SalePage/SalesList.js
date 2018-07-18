import React from "react";
import { Table, Dropdown } from 'semantic-ui-react';
import "./styles.css";


class SalesList extends React.Component{
    render(){
        return(
            
            <Table.Body className="salesOrdersBody">
                { this.props.orders.map((order) => {
                    return (<Table.Row key={order.reference}>
                        <Table.Cell>{order.reference}</Table.Cell>
                        <Table.Cell>{order.client.label === null ? "null" : order.client.label}</Table.Cell>
                        <Table.Cell>{order.buyer.label === null ? "null" : order.buyer.label}</Table.Cell>
                        <Table.Cell>{order.creator.label === null ? "null" : order.creator.label}</Table.Cell>
                        <Table.Cell>{new Date(order.created_on).toLocaleTimeString()}</Table.Cell>
                        <Table.Cell>{order.status}</Table.Cell>
                        <Table.Cell>{order.paid === null ? 0.0 : order.paid } / { order.amount === null ? 0.0 : order.amount }</Table.Cell>
                        <Table.Cell>
                        <Dropdown icon='ellipsis horizontal'>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled={order.status === "closed" ? true : false}>cart</Dropdown.Item>
                            <Dropdown.Item>view</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item>delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                        </Table.Cell>
                    </Table.Row>)
                })
            }
            </Table.Body>
        )
    }
}


export default SalesList;
