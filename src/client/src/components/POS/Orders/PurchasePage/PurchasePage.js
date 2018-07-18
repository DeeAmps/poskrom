import React from "react";
import MainNavbar from "../../../MainNavbar/MainNavbar";
import { Grid } from 'semantic-ui-react';
import ChildNavbar from "../../../ChildNavbar/ChildNavbar";
import ProductSearchList from "../../../ProductSearchList/ProductSearchList";
import CreatePurchaseOrder from "../../CreateOrders/CreatePurchaseOrder";
import { withRouter } from "react-router-dom";



class PurchasePage extends React.Component{
    render(){
        return(
            <div>
                <MainNavbar />
                <ChildNavbar  menu="purchases" cart={true}/>
                <CreatePurchaseOrder/>
                <Grid>
                    <Grid.Column width={4}>
                        <ProductSearchList/>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <h1>Purchase Page</h1>
                    </Grid.Column>
                </Grid>
                
            </div>
        )
    }
}


export default withRouter(PurchasePage);
