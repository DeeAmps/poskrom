import React from "react";
import {Route, Switch} from "react-router-dom";
import LoginPage  from "./components/LoginPage/LoginPage";
import SalePage from "./components/POS/Orders/SalePage/SalePage";
import PurchasePage from "./components/POS/Orders/PurchasePage/PurchasePage";
import TransferPage from "./components/POS/Orders/TransferPage/TransferPage";
import CartPage from "./components/POS/Orders/CartPage/CartPage";
import HomePage from "./components/HomePage/HomePage";
import CartSearchPage from "./components/POS/Orders/CartSearchPage/CartSearchPage";

class Routes extends React.Component{
    render(){
        return (
            <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/login" exact component={LoginPage} />
                <Route path="/pos/orders/sales" exact component={SalePage} />
                <Route path="/pos/orders/purchases" exact component={PurchasePage} />
                <Route path="/pos/orders/transfer" exact component={TransferPage} />
                <Route path="/pos/orders/:id" exact component={CartPage} />
                <Route path="/pos/orders/:id/:filter" exact component={CartSearchPage} />
            </Switch>
        )
    }
}

export default Routes;