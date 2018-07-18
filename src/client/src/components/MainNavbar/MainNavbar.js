import React from "react";
import { Dropdown, Menu, Input, Header, Button } from 'semantic-ui-react';
import { connect } from "react-redux";
import { withRouter} from 'react-router-dom';
import logo from "../../images/logo.png";
import "./MainNavbar.css";
import { getUserCart  } from "../../action/cartActions";
import { store } from "../../store/configureStore";

class MainNavbar extends React.Component{
    constructor(props){
        super(props);
        this.menuSelection = this.menuSelection.bind(this);
        this.productSearchChange = this.productSearchChange.bind(this);
        this.submitProductSearch = this.submitProductSearch.bind(this);
        if(localStorage.getItem("user_bibiara_app") != null){
            let username = JSON.parse(localStorage.getItem("user_bibiara_app")).nickname;
            let clientname = JSON.parse(localStorage.getItem("user_bibiara_app")).client_nickname;
            this.Logout = this.Logout.bind(this);
            this.state = {
                user : username,
                activeItem: 'POS',
                products: '',
                clients: '',
                clientName : clientname,
                options : [
                    {
                        text: 'POS',
                        value: 'POS',
                        link: "/pos/orders/sales"
                    },
                    {
                        text: 'REPORT',
                        value: 'REPORT',
                        link:"/report"
                    },
                    {
                        text: 'INVENTORY',
                        value: 'INVENTORY',
                        link:"/inventory"
                    },
                    
                ]
            }
        }
        else{
            this.props.history.push("/login");
        }
        
    }

    componentDidMount(){
        this.props.getUserCart();
    }

    Logout(e, value, text){
        localStorage.clear();
        return this.props.history.push("/login");
    }

    productSearchChange(e){
        this.setState({ [e.target.name] : e.target.value});
    }


    menuSelection(value){
        let link = this.state.options.find(x => x.text === value).link
        this.setState({activeItem : value});
        this.props.history.push(link);
    }

    submitProductSearch(e){
        const cartState  = store.getState().cartReducer;
        if(cartState.success){
            const cartId = parseInt(cartState.cart.cart_id, 10);
            this.props.history.push(`/pos/orders/${cartId}?filter=${this.state.products}`);
        }
        
    }

    render(){
        const val = this.state.activeItem;
        return (
            <div>
            <Menu stackable className="topNav">
                <Menu.Item>
                    <img src={logo} id="logo" alt="logo"/>
                </Menu.Item>
                <Header as='h4'>
                    <Header.Content > 
                        {' '}
                        <Dropdown className="posMenu" inline options={this.state.options} 
                        onChange={(e, { val }) => this.menuSelection(val)} defaultValue={this.state.activeItem} />
                    </Header.Content>
                </Header>

                <Menu.Item position='right'>
                    <Menu.Item className="searchProducts">
                    <Input name="products" action={ <Button icon='search' onClick={ this.submitProductSearch } />} 
                    placeholder="Search Products"  onChange={this.productSearchChange}/>

                    </Menu.Item>
                    <Menu.Item className="client">
                        <Input action={{ type: 'submit', content: 'Go' }} placeholder='Clients' 
                        value={this.state.clientName || this.state.user }/>
                    </Menu.Item>      
                    <Menu.Item>
                    <Dropdown text={this.state.user} className="loggedInOptions">
                        <Dropdown.Menu  onClick={this.logoutUser}>
                            <Dropdown.Item name="logout" text='Logout' onClick={this.Logout} />
                            <Dropdown.Item name="profile" text='Profile' />
                        </Dropdown.Menu>
                    </Dropdown>
                    </Menu.Item>   
                </Menu.Item>
            </Menu>
        </div>
        )
    }
}

export default connect(null, { getUserCart })(withRouter(MainNavbar));