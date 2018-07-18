import React from "react";
import { withRouter} from 'react-router-dom';
import CreateOrdersTemplate from "./CreateOrdersTemplate";


class CreateTransferOrder extends React.Component{
    render(){
        return (
            <div>
                <CreateOrdersTemplate text="create transfer order" link="/"/>
            </div>             
        )
    }
}

export default withRouter(CreateTransferOrder);