import React from "react";
import { withRouter } from "react-router-dom";

class CartSearchPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            buttonActive: true,
            error: "",
            cartEntries : {
                entries : [],
                reference_code : '',
                order_type: '',
                order_status: ''
            }
        }
    }

    componentDidMount(){
        let orderId = parseInt(this.props.match.params.id, 10)
        let productName = this.props.location.search.filter;
        console.log("OrderId " , orderId )
        console.log("Product Name " , productName);
    }

    render(){
        console.log(this.state.cartEntries.entries);
        const options = { lines: 13, length: 30, width: 10, radius: 50, scale: 1.00 };
        return(
            <div>
               <h1>Cart Search Page</h1>
            </div>
        )
    }
}


export default withRouter(CartSearchPage);
