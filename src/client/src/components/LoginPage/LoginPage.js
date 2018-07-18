import React from "react";
import sha256 from "sha256";
import { Button, Form , Card, Message } from 'semantic-ui-react';
import {Helmet} from 'react-helmet';
import { withRouter} from 'react-router-dom';
import "./login.css";
import Loader from "react-loader";
import { apiService } from "../../services/api";



class LoginPage extends React.Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.Login = this.Login.bind(this);
        this.loginFailed = this.loginFailed.bind(this);
        this.dismissErrorMessage = this.dismissErrorMessage.bind(this);
        this.state = {
            username : "",
            password : "",
            submitted: false,
            errors: {}
        }
        
    }

    loginSuccessful(){
        return this.props.history.push("pos/orders/sales");
    }

    loginFailed(message){
        this.setState({
            submitted: false,
            errors : {
                serverError : message
            }
        })
    }

    handleChange(e){
        this.setState({ [e.target.name] : e.target.value })
    }

    GenerateLoginHash(username, password){
        let hash = sha256(password + username.toLowerCase()).toString();
        return hash;
    }
    
    GenerateAuthHash(loginHash, time){
        let authHash = sha256(loginHash + time).toString();
        return authHash;
    }

    Login(e){
        e.preventDefault();
        const errors = this.validate(this.state); 
        this.setState({submitted : true, errors});
        const { username, password } = this.state;
        const loginHash = this.GenerateLoginHash(username, password);
        const timestamp = new Date().getTime();
        const authHash = this.GenerateAuthHash(loginHash, timestamp);
        let data = {
            username: username, 
            authhash: authHash, 
            timestamp: timestamp, 
            signature: password
        }
        if(Object.keys(errors).length === 0){
            apiService.login(data)
            .then(response => {
                if(response.data.code === 0){
                    localStorage.setItem("user_bibiara_app", JSON.stringify(response.data.user));
                    localStorage.setItem("currency_bibiara_app", JSON.stringify(response.data.currency));
                    this.loginSuccessful();  
                }
                else{
                    this.loginFailed("an error occured! Please contact support");
                }
            })
            .catch(err => {
                console.log(err);
                this.loginFailed(err);
            });      
        }
    }

    dismissErrorMessage(){
        this.setState({
            errors : {}
        })
    }


    validate(data){
        const errors = {};
        if(!data.username){
            errors.username = "Username cant be blank!";
        }
        if(!data.password){
            errors.password = "Password cant be blank!";
        }
        return errors;
    }

    render(){
        if(this.state.errors.serverError){
            return (
                <Message negative
                    content={this.state.errors.serverError}
                    header="Error"
                    onDismiss={this.dismissErrorMessage}
                />
            )
        }
        const options = { lines: 13, length: 20, width: 10, radius: 30, scale: 1.00 };
        return(
            <div>
                <Helmet>
                    <style>{'body, html { background-color: #76b852; overflow: hidden }'}</style>
                </Helmet>
                <Card id="login">
                    <Card.Description>
                        <Form onSubmit={this.Login}>
                            <Form.Field>
                                <label>Username</label>
                                {this.state.errors.username && <p style={{color : 'red'}}>{this.state.errors.username}</p>}
                                <input disabled={this.state.submitted} required autoFocus placeholder='Username' name="username" onChange={this.handleChange}/>
                            </Form.Field>
                            <Loader options={options} loaded={!this.state.submitted} className="spinner">
                            </Loader>
                            <Form.Field>
                                <label>Password</label>
                                {this.state.errors.password && <p style={{color : 'red'}}>{this.state.errors.password}</p>}
                                <input disabled={this.state.submitted} required type="password" placeholder='Password' name="password" onChange={this.handleChange}/>
                            </Form.Field>
                            <input id="timestamp-field" type="hidden" name="timestamp"/>
                            <input id="authhash-field" type="hidden" name="authhash"/>
                            <Button disabled={this.state.submitted} fluid color="green" type='submit' >Login</Button>
                        </Form>
                    </Card.Description>
                </Card>
            </div>
        )
    }
}



export default withRouter(LoginPage);
