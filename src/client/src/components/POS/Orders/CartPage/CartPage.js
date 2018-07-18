import React from "react";
import MainNavbar from "../../../MainNavbar/MainNavbar";
import { Grid } from 'semantic-ui-react';
import Loader from "react-loader";
import ChildNavbar from "../../../ChildNavbar/ChildNavbar";
import ProductSearchList from "../../../ProductSearchList/ProductSearchList";
import { withRouter } from "react-router-dom";
import CartSummaryNavbar from "../../CartSummaryNavbar/CartSummaryNavbar";
import { apiService } from "../../../../services/api";
import "./styles.css";

class CartPage extends React.Component{
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
        let orderId = parseInt(this.props.match.params.id, 10);
        
        apiService.getCartEntries(orderId)
        .then(response => {
            console.log("Cart Entries", response);
            if(response.data.code === 0){
                const cartEntries = response.data;
                this.setState({
                    loading: false,
                    buttonActive: false,
                    cartEntries : {
                        entries : cartEntries.entries,
                        reference_code : cartEntries.reference_code,
                        order_type : cartEntries.order_type,
                        order_status : cartEntries.order_status
                    }
                })
            }
            else if(response.data.code === 2){
                this.setState({
                    loading: false,
                    buttonActive: false,
                    error : response.data.error_message
                })
            }
        })
        .catch(err => {
            //TODO: Handle Error
            console.log(err)
        })
    }

    render(){
        console.log(this.state.cartEntries.entries);
        const options = { lines: 13, length: 30, width: 10, radius: 50, scale: 1.00 };
        return(
            <div>
                <MainNavbar/>
                <ChildNavbar cart={false}/>
                <CartSummaryNavbar data={this.state.cartEntries} buttonActive={this.state.buttonActive}/>
                <Grid className="innerGrid">
                    <div className="searchProduct">
                        <ProductSearchList/>
                    </div>
                        <Loader options={options} loaded={!this.state.loading}>
                        {
                            this.state.cartEntries.entries.length == 0 ?
                            <div><h1 id="cartMessage">No cart Entries</h1></div>
                            :
                            <div><h1>Cart Entries</h1></div>
                        } 
                        </Loader>
                </Grid>  
            </div>
        )
    }
}


export default withRouter(CartPage);
