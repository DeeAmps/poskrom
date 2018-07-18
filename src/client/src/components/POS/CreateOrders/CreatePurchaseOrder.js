import React from "react";
import { withRouter} from 'react-router-dom';
import CreateOrdersTemplate from "./CreateOrdersTemplate";

class CreatePurchaseOrder extends React.Component{
    render(){
        return (
            <div>
                <CreateOrdersTemplate text="create purchase order" link="/"/>
            </div>         
        )
    }
}

export default withRouter(CreatePurchaseOrder);