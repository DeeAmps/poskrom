import React from "react";

class HomePage extends React.Component{
    constructor(props){
        super(props);
        const loggedIn = localStorage.getItem("user_bibiara_app");
        if(loggedIn == null){
            return this.props.history.push("/login");
        }else{
            return this.props.history.push("/pos/orders/sales");
        }
    }

    render(){
        return(
            <div></div>
        )
    }
}

export default HomePage;