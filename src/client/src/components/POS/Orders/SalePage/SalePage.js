import React from "react";
import MainNavbar from "../../../MainNavbar/MainNavbar";
import { Grid } from 'semantic-ui-react';
import Loader from "react-loader";
import "./styles.css";
import {Helmet} from 'react-helmet';
import { apiService } from "../../../../services/api";
import ChildNavbar from "../../../ChildNavbar/ChildNavbar";
import CreateSalesOrder from "../../CreateOrders/CreateSalesOrder";
import ProductSearchList from "../../../ProductSearchList/ProductSearchList";
import SalesTable from "./SalesTable";



class SalePage extends React.Component{
    constructor(props){
        super(props);
        this.populateSaleOrders = this.populateSaleOrders.bind(this);
        this.state = {
            loadingOrders: true,
            orders: ""
        }
        this.getOrders();        
    }

    getOrders(){
        apiService.retrieveSalesOrders()
        .then((response) => {
            if(response.data.code === 0){
                 this.populateSaleOrders(response.data.sales_orders);  
            }
        })
        .catch((err) => {
            //TODO: Handle get cart orders error
            console.log("Error", err);
        });

    }

    populateSaleOrders(orders){
        this.setState({
            loadingOrders: false,
            orders
        })
    }

    render(){
        const options = { lines: 13, length: 30, width: 10, radius: 50, scale: 1.00 };
        return(
            <div>
                <Helmet>
                    <style>{'body {  overflow-y: scroll }'}</style>
                </Helmet>
                <MainNavbar/>
                <ChildNavbar menu="sales" cart={true}/>
                <CreateSalesOrder/>
                <Grid className="innerGrid">
                    <div className="searchProduct">
                        <ProductSearchList/>
                    </div>
                    <div className="salesOrderWindow">
                        <Loader className="orderLoading spinner" options={options} loaded={!this.state.loadingOrders}>
                            <SalesTable sales={this.state.orders}/>
                        </Loader>
                    </div> 
                </Grid>      
            </div>
        )
    }
}


export default SalePage;
