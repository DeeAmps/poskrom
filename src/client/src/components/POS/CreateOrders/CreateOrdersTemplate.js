import React from "react";
import { Button, Icon } from 'semantic-ui-react';
import { withRouter, Link} from 'react-router-dom';
import "./styles.css";

class CreateTransferOrder extends React.Component{
    render(){
        return (
            <div className="createOrderDiv">
                <Button className="ordersB" color="green">
                    {this.props.text}
                    <Link to={this.props.link}><Icon className="createIcon" name='shop' /></Link>
                </Button>
            </div>         
        )
    }
}

export default withRouter(CreateTransferOrder);