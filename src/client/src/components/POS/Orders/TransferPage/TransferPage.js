import React from "react";
import MainNavbar from "../../../MainNavbar/MainNavbar";
import { Grid } from 'semantic-ui-react';
import ChildNavbar from "../../../ChildNavbar/ChildNavbar";
import ProductSearchList from "../../../ProductSearchList/ProductSearchList";
import CreateTransferOrder from "../../CreateOrders/CreateTransferOrder";
import { withRouter } from "react-router-dom";


class TransferPage extends React.Component{
    
    render(){
        return (
            <div>
                <MainNavbar />
                <ChildNavbar menu="transfer" cart={true}/>
                <CreateTransferOrder/>
                <Grid>
                    <Grid.Column width={4}>
                        <ProductSearchList/>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <h1>Transfer Page</h1>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
}

export default withRouter(TransferPage);