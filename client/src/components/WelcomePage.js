import React from "react";
import '../index.css'
import Model from "../model.js"

class WelcomePage extends React.Component {

    constructor(props){
        super(props);

        this.state = {content: "login", username: "", password: "", email: "", passwordVerify: ""};
        this.handleRegisterNavigation = this.handleRegisterNavigation.bind(this);
        this.handleRegisterEvent = this.handleRegisterEvent.bind(this);
        this.handleInputEvent = this.handleInputEvent.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.updateAuthorizationState = props.updateAuthorizationState;
        this.updatePage = props.updatePage;
        this.updateUser = props.updateUser;
        this.model = new Model();
    }

    render(){
        if(this.state.content === "login"){
            return (
                <div className="WelcomePage">
                    <h1>Welcome to<br />Fake StackOverflow</h1>
                    <input className="registerInput" id="EmailInput" placeholder="Enter Email" onChange={this.handleInputEvent} value={this.state.email}></input>
                    <input className="registerInput" id="PasswordInput" placeholder="Enter Password" onChange={this.handleInputEvent} value={this.state.password} type={"password"}></input>
                    <div style={{color: "red"}}>
                        {this.state.errorMsg}
                    </div>
                    <button className="actionButton" style={{marginBottom: '10px', marginTop: '10px'}} onClick={this.handleLogin}>Login</button>
                    <hr style={{width: '50%'}} />
                    <button className="actionButton" style={{marginBottom: '10px', marginTop: '10px'}} onClick={this.handleRegisterNavigation}>Register</button>
                    <hr style={{width: '50%'}} />
                    <button className="actionButton" style={{marginBottom: '10px', marginTop: '10px'}} onClick={() => {this.updatePage("Questions")}}>Continue as Guest</button>
                </div>
            )
        }else if(this.state.content === "register"){
            return (
                <div className="WelcomePage">
                    <h1>Register for<br />Fake StackOverflow</h1>
                    <input className="registerInput" id="UsernameInput" placeholder="Create Username" onChange={this.handleInputEvent} value={this.state.username}></input>
                    <input className="registerInput" id="EmailInput" placeholder="Enter Email" onChange={this.handleInputEvent} value={this.state.email}></input>
                    <input className="registerInput" id="PasswordInput" placeholder="Create Password" onChange={this.handleInputEvent} value={this.state.password} type={"password"}></input>
                    <input className="registerInput" id="PasswordVerifyInput" placeholder="Re-enter Password" onChange={this.handleInputEvent} value={this.state.passwordVerify} type={"password"}></input>
                    <div style={{color: "red"}}>
                        {this.state.errorMsg}
                    </div>
                    <button className="actionButton" style={{marginBottom: '10px', marginTop: '10px'}} onClick={this.handleRegisterEvent}>Register</button>
                </div>
            )
        }
    }

    /**
     * Function that updates the content state of the WelcomePage when the 
     * register button is clicked.
     */
    handleRegisterNavigation(){
        this.setState({content: "register"});
    }

    /**
     * Function that handles user registration when the register button clicked. 
     * Uses state to get the username, email, password.
     */
    handleRegisterEvent(){
        const username = this.state.username;
        const email = this.state.email;
        const password = this.state.password; 
        const passwordVerify = this.state.passwordVerify;

        if(email.length === 0 || username.length === 0 || password.length === 0 || passwordVerify.length === 0){
            this.setState({errorMsg: "Each field is required!"})
            return;
        }else if(email.indexOf("@") === -1 || email.indexOf("@", email.indexOf("@") + 1) !== -1 || email.indexOf("@") === 0
        || email.indexOf("@") + 1 === email.length){
         
            this.setState({errorMsg: "Email must be of valid form <identifier>@<domain>"});
            return;
        }
        
        const emailID = email.substring(0, email.indexOf("@"));
        
        if(password !== passwordVerify || password.includes(emailID) || password.includes(username)){
            this.setState({errorMsg: "Passwords must match and must not include your email id or username!"});
        }else{
            this.model.createUser(username, email, password).then((result) => {
                this.setState({content: "login", username: "", password: "", email: "", passwordVerify: "", errorMsg: ""});
            }).catch((error) => {
                let errorMsg = Object.keys(error.response.data).length !== 0 ? error.response.data : "Error, please try again";
                this.setState({errorMsg: errorMsg});
            });
        }
    }

    /**
     * Function that is called when a user clicks login. 
     */
    handleLogin(){
        const email = this.state.email;
        const password = this.state.password;

        if(email.length === 0 || password.length === 0){
            this.setState({errorMsg: "Each field is required!"});
        }
        //TODO: Check email format
        else{
            this.model.loginUser(email, password).then((result) => {
                this.setState({username: "", password: "", email: "", passwordVerify: "", errorMsg: ""});
                this.updatePage("Questions");
                this.updateAuthorizationState(true);
                this.updateUser(result.data);
            }).catch((error) => {
                let errorMsg = error.response !== undefined && Object.keys(error.response.data).length !== 0 ? error.response.data : "Error, please try again";
                this.setState({errorMsg: errorMsg});
            })
        }
    }

    /**
     * Function that is called when a user types input. Uses the ID of the target to figure out which
     * state information to update
     */
    handleInputEvent(event){
        switch(event.target.id){
            case "UsernameInput":
                this.setState({username: event.target.value});
                break;
            case "PasswordInput":
                this.setState({password: event.target.value});
                break;
            case "EmailInput":
                this.setState({email: event.target.value});
                break;
            case "PasswordVerifyInput":
                this.setState({passwordVerify: event.target.value});
                break;
            default:
                break;
        }
    }
}



export default WelcomePage