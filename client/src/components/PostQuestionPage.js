import React from "react";
import Model from "../model.js"

class PostQuestionPage extends React.Component {

    constructor(props){
        super(props);
        if(props.question !== undefined){
            this.state = {title: props.question.title, text: props.question.text, tags: (props.question.tags + "").replace(",", " "), summary: props.question.summary}
        }else{
            this.state = {title: "", text: "", tags: "", summary: ""}
        }
        this.question = props.question;
        this.handleAskQuestion = this.handleAskQuestion.bind(this);
        this.handleInputEvent = this.handleInputEvent.bind(this);
        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
        this.model = new Model()
        this.updatePage = props.updatePage
    }

    render(){
        return (
            <div className="formInputViewDiv">
                <h2>Question Title<sup>*</sup></h2>
                <p>Limit question title to 100 characters or less</p>
                <input className="input" id="TitleInput" placeholder="Enter question title..." onChange={this.handleInputEvent} value={this.state.title}></input>
                
                <h2>Question Summary<sup>*</sup></h2>
                <p>Limit question summary to 140 characters or less</p>
                <input className="input" id="SummaryInput" placeholder="Enter question summary..." onChange={this.handleInputEvent} value={this.state.summary}></input>
    
                <h2>Question Text<sup>*</sup></h2>
                <p>Add details</p>
                <textarea className="textArea" id="TextInput" placeholder="Enter question details..." onChange={this.handleInputEvent} value={this.state.text}></textarea>
                <h2>Tags<sup>*</sup></h2>
                <p>Add keywords separated by whitespace</p>
                <input className="input" id="TagsInput" placeholder="Enter question tags..." onChange={this.handleInputEvent} value={this.state.tags + ""}/>
                <div style={{color: "red", marginTop: "30px"}}>
                    {this.state.errorMsg}
                </div>
                <div>
                    <button className="actionButton" style={{margin: '10px'}} onClick={this.handleAskQuestion}>Post Question</button>
                    {this.question !== undefined ? <button className="actionButton" style={{margin: '10px'}} onClick={this.handleDeleteQuestion}>Delete Question</button> : null}
                </div>
            </div>
        )
    }

    /**
     * Function that is called whenever the ask question button is clicked.
     */
    handleAskQuestion(){
        if(this.state.title.length === 0){
            return this.setState({errorMsg: "Question title is required!"});
        }else if(this.state.text.length === 0){
            return this.setState({errorMsg: "Question text is required!"});
        }else if(this.state.tags.length === 0){
            return this.setState({errorMsg: "Question tags are required!"});
        }else if(this.state.summary.length === 0 || this.state.summary.length > 140){
            return this.setState({errorMsg: "Question summary must be between 1 and 140 characters!"})
        }

        let tagsArr = this.state.tags.split(" ");
        tagsArr = tagsArr.filter((tag) => {return tag.length !== 0});
        if(tagsArr.length > 5) return this.setState({errorMsg: "Question tags are required!"});
        if(tagsArr.find((tag) => {return tag.length > 10}) !== undefined) return this.setState({errorMsg: "Question tags cannot be longer than 10 characters!"});

        let lowercaseTags = [];

        tagsArr.forEach((tag) => {
            if(!lowercaseTags.includes(tag.toLowerCase())){
                lowercaseTags.push(tag.toLowerCase());
            }
        })

        if(this.question === undefined){
            this.model.postQuestion(this.state.title, this.state.summary, this.state.text, tagsArr).then((result) => {
                this.updatePage("Questions");
            }).catch((error) => {
                let errorMsg = Object.keys(error.response.data).length !== 0 ? error.response.data : "Error, please try again";
                this.setState({errorMsg: errorMsg});
            })
        }else{ 
            const questionObj = this.question;
            questionObj.title = this.state.title;
            questionObj.summary = this.state.summary;
            questionObj.text = this.state.text;
            questionObj.tags = tagsArr
            this.model.updateQuestion(questionObj).then((result) => {
                this.updatePage("Profile");
            }).catch((error) => {
                let errorMsg = Object.keys(error.response.data).length !== 0 ? error.response.data : "Error, please try again";
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
            case "TitleInput":
                this.setState({title: event.target.value});
                break;
            case "TextInput":
                this.setState({text: event.target.value});
                break;
            case "TagsInput":
                this.setState({tags: event.target.value});
                break;
            case "SummaryInput":
                this.setState({summary: event.target.value});
                break;
            default:
                break;
        }
    }

    /**
     * Function that is called whenever the delete question button is clicked.
     */
    handleDeleteQuestion(){
        this.model.deleteQuestion(this.question._id).then(() => {
            this.updatePage("Profile");
        }).catch((error) => {
            console.log(error);
            alert("Server error");
        })
    }
}

export default PostQuestionPage
