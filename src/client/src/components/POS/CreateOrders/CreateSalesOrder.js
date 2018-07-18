import React from "react";
import { withRouter} from 'react-router-dom';
import CreateOrdersTemplate from "./CreateOrdersTemplate";


class CreateSalesOrder extends React.Component{
    render(){
        return (
            <div>
                <CreateOrdersTemplate text="create sales order" link="/"/>
            </div>            
        )
    }
}

export default withRouter(CreateSalesOrder);