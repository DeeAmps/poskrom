import React from "react";
import { Menu , Icon, Modal } from 'semantic-ui-react';
import { withRouter} from 'react-router-dom';
import "./ChildNavbar.css";
import { store } from "../../store/configureStore";
import { connect } from "react-redux";
import { getUserCart  } from "../../action/cartActions"
import Loader from "react-loader";

class ChildNavbar extends React.Component{
    constructor(props){
        super(props);
        this.processOrderCart = this.processOrderCart.bind(this);
        this.state = {
            activeItem : this.props.menu,
            loading : false,
            errors : {}
        }

    }

    componentDidMount(){
        this.props.getUserCart();
    }
    
    handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name });
        this.props.history.push(`/pos/orders/${name}`);
    };

    processOrderCart(){
        this.setState({loading: true});
        const cartState  = store.getState().cartReducer;
        if(cartState.success){
            const cartId = parseInt(cartState.cart.cart_id, 10);
            this.props.history.push(`/pos/orders/${cartId}`);
        }
    }
    render(){
        const options = { lines: 13, length: 20, width: 10, radius: 30, scale: 1.00 };
        return (
            <div>
            <Modal trigger={this.state.errors.cart_error}>
                <Modal.Content image>
                <Modal.Description>
                    <p>{this.state.errors.cart_error}</p>
                </Modal.Description>
                </Modal.Content>
            </Modal>
                <Menu pointing secondary className="ChildNav">
                <Menu.Item name='sales' active={this.state.activeItem === 'sales' } onClick={this.handleItemClick} />
                <Menu.Item name='purchases'  active={this.state.activeItem === 'purchases' } onClick={this.handleItemClick}/>
                <Menu.Item name='transfer'  active={this.state.activeItem === 'transfer' } onClick={this.handleItemClick}/>
                {this.props.cart 
                    ? 
                <Menu.Item position='right'>
                    <Icon id="shoppingCart" name='shopping cart' onClick={this.processOrderCart}>
                    </Icon>
                </Menu.Item>
                 :
                 <Menu.Item></Menu.Item>
                }
                </Menu>
                {this.state.loading && <Loader options={options} loaded={!this.state.loading} className="spinner">
                </Loader>}   
            </div>         
        )
    }
}

export default connect(null, { getUserCart })(withRouter(ChildNavbar));