import React from "react";
import { Button, Input, Menu } from 'semantic-ui-react';
import { withRouter} from 'react-router-dom';
import "./styles.css";

class CartSummaryNavbar extends React.Component{
    render(){
        return (
            <Menu secondary className="cartMenu">
                <Menu.Item position="right">
                <p className="salesRef">sale reference: {this.props.data.reference_code}( {this.props.data.order_status} )</p>                
                </Menu.Item>
                <Menu.Item position="right" className="total">
                <Input
                id="cartInput"
                action={{ color: 'teal', labelPosition: 'left', icon: 'money bill alternate outline', content: 'TOTAL GHC' }}
                actionPosition='left'
                value='52.03'
                className="totalInput"
                />
                </Menu.Item>
                <Menu.Item position="right">
                    <Button className="ordersButton" color="green" disabled={this.props.buttonActive}>
                        summary
                    </Button>                
                </Menu.Item>
                
            </Menu>         
        )
    }
}

export default withRouter(CartSummaryNavbar);