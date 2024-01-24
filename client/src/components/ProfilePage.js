import React from "react";
import Model from "../model.js"
import TagsPage from "./TagsPage.js"
import QuestionsPage from "./QuestionsPage.js"
import QuestionDetails from "./QuestionDetails.js";

class ProfilePage extends React.Component {

    constructor(props){
        super(props)
        this.updatePage = props.updatePage;
        this.updateAuthorizationState = props.updateAuthorizationState;
        this.updateUser = props.updateUser;
        this.state = {user: {admin: false, username: "", reputation: "", email: props.email, date: undefined, tags: []}, 
        questions: [], 
        content: "Questions", 
        answeredQuestions: [],
        users: []}
        this.model = new Model();
        this.updatePage = props.updatePage;
        this.handleQuestionClick = this.handleQuestionClick.bind(this);
        this.handleContentButtons = this.handleContentButtons.bind(this);
        this.handleAnsweredQuestionClick = this.handleAnsweredQuestionClick.bind(this);
        this.handleEditAnswerClick = this.handleEditAnswerClick.bind(this);
        this.handleInputEvent = this.handleInputEvent.bind(this);
        this.updateAnswer = this.updateAnswer.bind(this);
        this.deleteAnswer = this.deleteAnswer.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.viewUserProfile = this.viewUserProfile.bind(this);
    }

    componentDidMount(){
        this.model.getUser(this.state.user.email).then((user) => {
            this.model.getQuestions(user.questions).then((questions) => {
                this.model.getAnsweredQuestions(user.answers).then((answeredQuestions) => {
                    if(user.admin === true){
                        this.model.getAllUsers().then((users) => {
                            this.setState({user: user, questions: questions, answeredQuestions: answeredQuestions, content: "Users", users: users});
                        }).catch((error) => {
                            alert("Server error, please try again");
                        })
                    }else{
                        this.setState({user: user, questions: questions, answeredQuestions: answeredQuestions})
                    }
                }).catch((error) => {
                    alert("Server error, please reload the page and try again.");
                })
            }).catch(() => {
                alert("Server error, please reload the page and try again");
            })
        }).catch(() => {
            alert("Server error, please reload the page and try again.");
        })
    }

    render(){  
        return (
            <div className="profilePage">
                <h1>Welcome, {this.state.user.username}</h1>
                <p>Member Since: {new Date(this.state.user.date).toLocaleDateString('en-us', {})}</p>
                <p>Reputation: {this.state.user.reputation}</p>
                <div className="profileQuestionsContainer">
                    <div>
                        {this.state.user.admin === true ? <button className={this.state.content === "Users" ? "actionButtonDisabled" : "actionButton"} style={{margin: '10px'}} onClick={() => {this.handleContentButtons("Users")}}>View Users</button> : null}
                        <button className={this.state.content === "Questions" ? "actionButtonDisabled" : "actionButton"} style={{margin: '10px'}} onClick={() => {this.handleContentButtons("Questions")}}>View Questions</button>
                        <button className={this.state.content === "Answers" ? "actionButtonDisabled" : "actionButton"} style={{margin: '10px'}} onClick={() => {this.handleContentButtons("Answers")}}>View Answers</button>
                        <button className={this.state.content === "Tags" ? "actionButtonDisabled" : "actionButton"} style={{margin: '10px'}} onClick={() => {this.handleContentButtons("Tags")}}>View Tags</button>
                    </div>
                    {this.loadContent()}
                </div>
            </div>
        )
    }

    /**
     * Function that is called whenever the view questions, answers, or tags button is clicked. 
     * Handles updating state to show correct content.
     * @param {String} content Questions, Answers, or Tags
     */
    handleContentButtons(content){
        this.setState({content: content});
    }

    /**
     * Updates HTML element based on content state, viewing questions, answers or tags by user.
     * @returns HTML element of page content
     */
    loadContent(){
        if(this.state.content === "Questions"){
            return (
                <QuestionsPage updatePage={this.updatePage} 
                    allQuestions={this.state.questions} 
                    questionsList={this.state.questions.slice(0, 5)}
                    displayHeader={false} 
                    fetchQuestions={false}
                    handleQuestionClick={this.handleQuestionClick}
                    key="questions"/>
            );
        }else if(this.state.content === "Answers"){
            return (
                <QuestionsPage updatePage={this.updatePage} 
                    allQuestions={this.state.answeredQuestions} 
                    questionsList={this.state.answeredQuestions.slice(0, 5)}
                    displayHeader={false} 
                    fetchQuestions={false}
                    handleQuestionClick={this.handleAnsweredQuestionClick}
                    key="answered"/>
            )
        }else if(this.state.content === "Tags"){
            return (      
                <TagsPage tags={this.state.user.tags}/>
            )
        }else if(this.state.content === "AnsweredQuestionDetails"){
            return (
                <QuestionDetails question={this.state.editAnsweredQuestion} 
                displayAnswerQuestionButton={false} 
                key={this.state.editAnsweredQuestion._id + "profile"} 
                handleAllQuestionsButtonClick={this.handleAllQuestionsButtonClick} 
                displayBackButton={false} 
                handleEditAnswer={this.handleEditAnswerClick}
                user={this.state.user}/>
            )
        }else if(this.state.content === "EditAnswer"){
            return (
                <div className="formInputViewDiv">
                    <h2>Answer Text<sup>*</sup></h2>
                    <textarea className="textArea" placeholder="Enter answer details..." id="AnswerInput" onChange={this.handleInputEvent} value={this.state.updatedAnswer}></textarea><br />
                    <div style={{color: "red", marginTop: "30px"}}>
                        {this.state.errorMsg}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <button className="actionButton" style={{marginTop: '30px', marginBottom: '10px', marginRight: '10px'}} onClick={this.updateAnswer}>Update Answer</button>
                        <button className="actionButton" style={{marginTop: '30px', marginBottom: '10px'}} onClick={this.deleteAnswer}>Delete Answer</button>
                    </div>
                </div>
            )
        }else if(this.state.content === "Users"){
            return (
                <div>
                    <h2>Users</h2>
                    {this.loadUsers()}
                </div>
            )
        }
    }

    loadUsers(){
        return this.state.users.map((user) => {
            return (
                <div style={{display: 'flex', flexDirection: 'row', border: '2px solid lightseagreen', marginBottom: '3px', padding: '10px'}}>
                    <h4 style={{margin: 'auto'}}>{user.username}</h4>
                    <p style={{margin: 'auto'}}>{user.email}</p>
                    <button className="actionButton" style={{margin: 'auto'}} id={user.email} onClick={this.viewUserProfile}>View Profile</button>
                    <button className="actionButton" style={{margin: 'auto'}} id={user.email} onClick={this.deleteUser}>Delete User</button>
                </div>
            )
        })
    }

    viewUserProfile(event){
        this.model.getUser(event.target.id).then((user) => {
            this.model.getQuestions(user.questions).then((questions) => {
                this.model.getAnsweredQuestions(user.answers).then((answeredQuestions) => {
                    if(user.admin === true){
                        this.model.getAllUsers().then((users) => {
                            this.setState({user: user, questions: questions, answeredQuestions: answeredQuestions, content: "Users", users: users});
                        }).catch((error) => {
                            alert("Server error, please try again");
                        })
                    }else{
                        this.setState({content: "Questions", user: user, questions: questions, answeredQuestions: answeredQuestions})
                    }
                }).catch((error) => {
                    alert("Server error, please reload the page and try again.");
                })
            }).catch(() => {
                alert("Server error, please reload the page and try again");
            })
        }).catch(() => {
            alert("Server error, please reload the page and try again.");
        })
    }

    deleteUser(event){
        if(window.confirm("Are you sure you want to delete user with email " + event.target.id)){
            this.model.deleteUser(event.target.id).then(() => {
                if(this.state.user.email === event.target.id){
                    this.model.logoutUser().then((result) => {
                        this.updatePage("Welcome");
                        this.updateAuthorizationState(false);
                        this.updateUser(null);
                    }).catch((error) => {
                        alert(error);
                    })
                }else{
                    this.setState({users: this.state.users.filter((u) => {return u.email !== event.target.id})});
                }
            });
        }
    }

    deleteAnswer(event){
        const ansID = this.state.editAnswer._id;
        const questionID = this.state.editAnswerQuestion._id;
        this.model.deleteAnswer(ansID, questionID).then(() => {
            this.setState({content: "Questions"});
        }).catch((error) => {
            this.setState({errorMsg: "Server error"});
        })
    }   

    updateAnswer(event){
        const ansID = this.state.editAnswer._id
        const text = this.state.updatedAnswer;

        if(text.length === 0){
            this.setState({errorMsg: "Answer length cannot be 0!"})
            return;
        }

        this.model.updateAnswer(ansID, text).then((result) => {
            this.setState({content: "Questions"});
        }).catch((error) => {
            console.log(error);
            this.setState({errorMsg: "Server error please try again."});
        })
    }

    handleInputEvent(event){
        switch(event.target.id){
            case "AnswerInput":
                this.setState({updatedAnswer: event.target.value});
                break;
            default:
                break;
        }
    }

    handleEditAnswerClick(event){
        var answer = null;
        var question = null;
        this.state.answeredQuestions.forEach((q) => {
            for(let ans of q.answers){
                if(ans._id === event.target.id){
                    answer = ans;
                    question = q;
                    break;
                }
            }
        })

        this.setState({content: "EditAnswer", 
            editAnswer: answer,
            editAnswerQuestion: question,
            updatedAnswer: answer.text
        })
    }

    /**
     * Function that is called whenever the question title is clicked.
     * Handles updating page to ask question page and populating information.
     */
    handleQuestionClick(event){
        const question = this.state.questions.find((q) => {return q._id === event.target.id})
        this.updatePage("AskQuestion", question);
    }

    /**
     * Function that is called whenever the question title is clicked for a question answered by user.
     * Handles updating page to correctly show answers.
     */
    handleAnsweredQuestionClick(event){
        let question = this.state.answeredQuestions.find((q) => {
            return q._id === event.target.id;
        })
        this.setState({content: "AnsweredQuestionDetails", editAnsweredQuestion: question})
    }
}

export default ProfilePage