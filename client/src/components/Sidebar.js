import React from "react";
import Model from "../model.js";

class Sidebar extends React.Component {
    constructor(props){
        super(props);
        
        this.model = new Model();
        this.handleLogout = this.handleLogout.bind(this);
        this.handleQuestionsButton = this.handleQuestionsButton.bind(this);
        this.updatePage = props.updatePage;
        this.updateUser = props.updateUser;
        this.updateAuthorizationState = props.updateAuthorizationState;
    }

    render(){
        return (
            <div id="Sidebar">
                <button className={(this.props.page === 'Questions') ? "sidebarButtonSelected" : "sidebarButtonDefault"} id="SidebarButtonQuestions" onClick={this.handleQuestionsButton}>Questions</button>
                <button className={this.props.page === 'Tags' ? "sidebarButtonSelected" : "sidebarButtonDefault"} id="SidebarButtonTags" onClick={() => {this.updatePage("Tags")}}>Tags</button>
                {this.props.authorized === true ? <button className={this.props.page === "AskQuestion" ? "sidebarButtonSelected" : "sidebarButtonDefault"} id="SidebarButtonTags" onClick={() => {this.updatePage("AskQuestion")}}>Ask Question</button> : null}
                {this.props.authorized === true ? <button className={this.props.page === "Profile" ? "sidebarButtonSelected" : "sidebarButtonDefault"} id="SidebarButtonTags" onClick={() => {this.updatePage("Profile")}}>Profile</button> : null}
                {this.props.authorized === false && this.props.page !== "Welcome" ? <button className="sidebarButtonDefault" id="SidebarButtonTags" onClick={() => {this.updatePage("Welcome")}}>Log In</button> : null}
                {this.props.authorized === true ? <button className="sidebarButtonDefault" id="SidebarButtonTags" onClick={this.handleLogout}>Log Out</button> : null}
            </div> 
        )
    }

    /**
     * Function that is called whenever a user clicks on the questions page sidebar button.
     * @param {Event} event 
     */
    handleQuestionsButton(event){
        this.updatePage("Questions");
    }

     /**
     * Function that is called when a user clicks logout. 
     */
    handleLogout(){
        this.model.logoutUser().then((result) => {
            this.updatePage("Welcome");
            this.updateAuthorizationState(false);
            this.updateUser(null);
        }).catch((error) => {
            alert(error);
        })
    }


}

export default Sidebar;