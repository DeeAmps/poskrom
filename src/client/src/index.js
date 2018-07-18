import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import Routes from "./routes";
import { Provider } from 'react-redux';
import { store } from "./store/configureStore";
import 'semantic-ui-css/semantic.min.css';


ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes/>
        </BrowserRouter>
    </Provider>, 
    document.getElementById("root"))


