import React from "react";
import Model from "../model.js"
import SearchBar from "./SearchBar.js";
import QuestionContainer from "./QuestionContainer.js";
import QuestionDetails from "./QuestionDetails.js";

class QuestionsPage extends React.Component {

    constructor(props){
        super(props);
        this.displayHeader = props.displayHeader;
        this.fetchQuestions = props.fetchQuestions;
        this.updateContent = this.updateContent.bind(this);
        this.updatePage = props.updatePage;
        this.handleInputEvent = this.handleInputEvent.bind(this);
        this.displayQuestions = this.displayQuestions.bind(this);
        this.handleNavigationButton = this.handleNavigationButton.bind(this);
        this.sortQuestions = this.sortQuestions.bind(this);
        if(props.handleQuestionClick === undefined){
            this.handleQuestionClick = this.handleQuestionClick.bind(this);
        }else{
            this.handleQuestionClick = props.handleQuestionClick;
        }
        this.handleAnswerQuestionClick = this.handleAnswerQuestionClick.bind(this);
        this.handlePostAnswer = this.handlePostAnswer.bind(this);
        this.handleAllQuestionsButtonClick = this.handleAllQuestionsButtonClick.bind(this);
        this.updateOffset = this.updateOffset.bind(this);
        this.updateQuestionsList = this.updateQuestionsList.bind(this);
        this.updateAllQuestions = this.updateAllQuestions.bind(this);
        this.model = new Model()
        this.state = {content: "QuestionsList", errorMsg: "", offset: 0, questionToDisplay: null, answerText: "", activeSort: 1,
        allQuestions: this.props.allQuestions, questionsList: this.props.questionsList}; // title: "", text: "", tags: "", summary: ""
        this.user = props.user;
        this.authorized = props.authorized;
    }

    componentDidUpdate(prevProps){
        if(prevProps.allQuestions !== this.props.allQuestions){
            this.setState({allQuestions: this.props.allQuestions, questionsList: this.props.allQuestions.slice(0, 5)})
        }   
    }

    componentDidMount(){
        if(this.fetchQuestions === false){return;}
        this.model.getAllQuestions().then((result) => {
            result.sort((a, b) => {
                return new Date(a.ask_date_time) < new Date(b.ask_date_time);
            })
            this.setState({allQuestions: result, questionsList: result.slice(0, 5)})
        }).catch((error) => {
            alert("There was a server error loading questions, please reload and try again.")
        })
    }

    render(){
        return(
            this.loadContent()
        )
    }

    updateQuestionsList(questionsList){
        this.setState({questionsList: questionsList});
    }

    updateAllQuestions(allQuestions){
        this.setState({allQuestions: allQuestions})
    }

    sortQuestions(event){
        const sort = event.target.id;
        if(sort === "newest"){
            if(this.state.activeSort === 1) return;
            this.model.getAllQuestions().then((questions) => {
                questions.sort((a, b) => {
                    return new Date(a.ask_date_time) < new Date(b.ask_date_time);
                })
                this.setState({allQuestions: questions, questionsList: questions.slice(0, 5), offset: 0, activeSort: 1});
            })
        }else if(sort === "active"){
            if(this.state.activeSort === 2) return;
            this.model.getAllQuestions().then((questions) => {
                questions.sort((a, b) => {
                    if(a.answers.length === 0) return 1;
                    if(b.answers.length === 0) return -1;
    
                    let aRecent = new Date(a.answers[0].ans_date_time);
                    for(let answer of a.answers){
                        let date = new Date(answer.ans_date_time);
                        if(date > aRecent) aRecent = date;
                    }
    
                    let bRecent = new Date(b.answers[0].ans_date_time);
                    for(let answer of b.answers){
                        let date = new Date(answer.ans_date_time);
                        if(date > bRecent) bRecent = date;
                    }
    
                    if(aRecent > bRecent){
                        return -1;
                    }else{
                        return 1;
                    }
                })
                this.setState({allQuestions: questions, questionsList: questions.slice(0, 5), offset: 0, activeSort: 2});
            })
        }else if(sort === "unanswered"){
            if(this.state.activeSort === 3) return;
            var questions = this.state.allQuestions.slice();
            questions = questions.filter((q) => {
                return q.answers.length === 0;
            })
            this.setState({allQuestions: questions, questionsList: questions.slice(0, 5), offset: 0, activeSort: 3});
        }
    }

    /**
     * Function that returns the proper HTML to be rendered depending on content state.
     * @returns {HTML} Page content.
     */
    loadContent(){
        if(this.state.content === "QuestionsList"){
            return (<div>
                        {this.displayHeader ? (<div className="contentDiv">
                            <div className="questionsHeader">
                                <h1 className="questionsHeaderLabel">All Questions</h1>
                                <SearchBar updateQuestionsList={this.updateQuestionsList} updateAllQuestions={this.updateAllQuestions}/>
                                <div id="QuestionsInfoDiv">
                                    <p style={{fontSize: '20px', marginRight: '50vw'}}>{this.state.questionsList.length + " Questions"}</p>
                                    <button className={this.state.activeSort === 1 ? "sortButtonActive" : "sortButton"} id="newest" onClick={this.sortQuestions} >Newest</button>
                                    <button className={this.state.activeSort === 2 ? "sortButtonActive" : "sortButton"} id="active" onClick={this.sortQuestions} >Active</button>
                                    <button className={this.state.activeSort === 3 ? "sortButtonActive" : "sortButton"} id="unanswered" onClick={this.sortQuestions}>Unanswered</button>
                                </div>
                            </div>
                        </div>) : null}
                        <div style={{overflowY: 'scroll', maxHeight: '40vh'}}>
                            {this.displayQuestions()}
                        </div>
                        {this.state.allQuestions.length > 5 ? 
                        <div className="pageButtonContainer">
                            <button className="pageButton" id="prev" onClick={this.handleNavigationButton}>Prev</button>
                            <button className="pageButton" id="next" onClick={this.handleNavigationButton}>Next</button>
                        </div> : null}
                    </div>)
        }else if(this.state.content === "DisplayQuestion"){
            let question = this.state.allQuestions.find((question) => {return question._id === this.state.questionToDisplay}); 
            return (
                <QuestionDetails question={question} displayAnswerQuestionButton={true} key={question._id} handleAllQuestionsButtonClick={this.handleAllQuestionsButtonClick} handleAnswerQuestionClick={this.handleAnswerQuestionClick} authorized={this.authorized}/>
            )
        }else if(this.state.content === "AnswerQuestion"){
            return (
                <div className="formInputViewDiv">
                    <h2>Answer Text<sup>*</sup></h2>
                    <textarea className="textArea" placeholder="Enter answer details..." id="AnswerInput" onChange={this.handleInputEvent}></textarea><br />
                    <div style={{color: "red", marginTop: "30px"}}>
                        {this.state.errorMsg}
                    </div>
                    <button className="actionButton" style={{marginTop: '30px', marginBottom: '10px'}} onClick={this.handlePostAnswer}>Post Answer</button>
                </div>
            )
        }
    }

    /**
     * Function that is called whenever the user clicks the post answer button in the form.
     * @param {Event} event 
     */
    handlePostAnswer(event){
        if(this.state.answerText.length === 0){
            this.setState({errorMsg: "Answer text cannot be empty!"});
            return;
        }

        this.model.postAnswer(this.state.answerText, this.state.questionToDisplay).then((result) => {
            let updatedQuestion = this.state.allQuestions.find((question) => {return question._id === this.state.questionToDisplay});
            updatedQuestion.answers.push(result);
            let questionsArr = this.state.allQuestions.filter((question) => {return question._id !== updatedQuestion._id});
            questionsArr.push(updatedQuestion);
            this.updateAllQuestions(questionsArr);
            this.setState({answerText: "", errorMsg: "", content: "DisplayQuestion"});
        }).catch((error) => {
            this.setState({errorMsg: Object.keys(error.response.data) !== 0 ? error.response.data : "Server error"});
        });
    }

    

    /**
     * Function that returns an array of HTML elements that will display the tags.
     * @returns An array of HTML elements
     */
    tagItems(tags){
        return tags.map((tag) => {
            return (
                <div className='tagDiv' key={tag}>
                    {tag}
                </div>
            )
        })
    }

    /**
     * Function that returns an array of HTML elements that will display the questions.
     * @returns An array of HTML elements
     */
    displayQuestions(){
        if(this.state.questionsList.length === 0){
            return (
                <h1 style={{marginLeft: '40px'}}>No Questions!</h1>
            )
        }else{

            return this.state.questionsList.map((question) => {
                return (
                    <QuestionContainer id={question._id} question={question} handleQuestionClick={this.handleQuestionClick} key={question._id}/>
                )
            })
        }
    }

    /**
     * Function that updates the content state of the questions page.
     * @param {String} content New content page to be shown. 
     */
    updateContent(content){
        this.setState({content: content, errorMsg: ""});
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
            case "AnswerInput":
                this.setState({answerText: event.target.value});
                break;
            default:
                break;
        }
    }

    /**
     * Function that will return a properly formatted asked label given a username and date.
     * @param {String} user Username of user who posted question
     * @param {Date} date Date object representing time question was posted
     * @param {String} verb Which verb to use when describing action. (answered or asked)
     * @returns String that will be properly formatted.
     */
    formatLabel(user, date, verb){
        const now = new Date();
      
        const monthName = date.toLocaleString('default', { month: 'short' });
        const minutes = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
      
        if(date.getDate() === now.getDate() && date.getFullYear() === now.getFullYear()){ //seconds, minutes, or hours
          if(now - date <= 60 * 1000){ 
            //seconds ago
            return user + " " + verb + " " + Math.floor(((now - date) / 1000)) + " seconds ago";
          }else if(now - date <= 60 * 60 * 1000){
            //minutes ago
            return user + " " + verb + " " + Math.floor(((now - date) / 1000 / 60)) + " minutes ago"; 
          }else{
            //hours ago
            return user + " " + verb + " " + Math.floor(((now - date) / 1000 / 60 / 60)) + " hours ago";
          }
        }else if(date.getFullYear() === now.getFullYear()){//month day time
          return user + " " + verb + " " + monthName + " " + date.getDate() + " at " + date.getHours() + ":" + minutes;
        }else{//month day year time
          return user + " " + verb + " " + monthName + " " + date.getDate() + ", " + date.getFullYear() + " at " + date.getHours() + ":" + minutes;
        }
    }

    /**
     * Function that is called whenever the prev or next buttons are clicked.
     * Handles updating the questions to display array and the current page.
     * @param {Event} event 
     */
    handleNavigationButton(event){
        if(event.target.id === "prev"){
            if(this.state.offset === 0) return;
            this.setState({offset: this.state.offset - 1, questionsList: this.state.allQuestions.slice((this.state.offset - 1) * 5, ((this.state.offset - 1) * 5) + 5)});
        }else{//next
            if(this.state.offset * 5 + 5 >= this.state.allQuestions.length) return;
            this.setState({offset: this.state.offset + 1, questionsList: this.state.allQuestions.slice((this.state.offset + 1) * 5, ((this.state.offset + 1) * 5) + 5)});
        }
    }

    /**
     * Function that is called whenever the user presses on a question. Handles changing the state to display
     * question details.
     * @param {Event} event 
     */
    handleQuestionClick(event){
        let questionID = event.target.id;
        let question = this.state.allQuestions.find((question) => {return question._id === questionID});
        question.views = question.views + 1;
        let questionsArr = this.state.allQuestions.filter((question) => {return question._id !== questionID});
        questionsArr.push(question);
        this.model.incrementViews(event.target.id).then(() => {
            this.updateAllQuestions(questionsArr);
            this.setState({content: "DisplayQuestion", questionToDisplay: event.target.id});
        }).catch(() => {
            this.setState({content: "DisplayQuestion", questionToDisplay: event.target.id});//we do not have to worry about this because views is not a critical operation
        })
    }

    /**
     * Function that takes in questionText and replaces all occurrences of hyper links with html elements
     * @param {*} questionText The text that should be transformed.
     * @returns An array of HTML elements representing the text and hyper links.
     */
    formatText(questionText){
        let prev = 0;
        let i = 0;
        
        let joined = []
      
        for(i = 0; i < questionText.length; i++){
          if(questionText.charAt(i) === '['){
              const closeBrackIndex = questionText.indexOf("]", i);
              if(closeBrackIndex !== -1){
                if(questionText.charAt(closeBrackIndex + 1) === '('){
                    const closeParenIndex = questionText.indexOf(")", closeBrackIndex + 1);
                    const hyperName = questionText.substring(i + 1, closeBrackIndex);
                    const link = questionText.substring(closeBrackIndex + 2, closeParenIndex);
                    
                    if(link.length === 0 || (!link.startsWith("https://") && !link.startsWith("http://"))) return alert("Hyper link included in text must not be empty and must start with http:// or https://");
                    joined.push(questionText.substring(prev, i));
                    i = closeParenIndex;
                    prev = closeParenIndex + 1;
                    joined.push({link: link, label: hyperName});
                }
              }
          }
        }
      
        joined.push(questionText.substring(prev, i));
      
        const items = [];
      
        for(let element of joined){
          if(typeof(element) === "string"){
            items.push(
              <p key={element} style={{display: 'inline'}}>{element}</p>
            );
          }else{
            let prev = items.pop();
            if(prev){
              items.push(
                <p key={element.label + element.link} style={{display: 'inline'}}>
                  {prev.key}
                  <a target="_blank" rel="noreferrer" href={element.link}>{element.label}</a>
                </p>
              )
           }else{
              items.push(
                <p key={element.label + element.link} style={{display: 'inline'}}>
                  <a target="_blank" rel="noreferrer" href={element.link}>{element.label}</a>
                </p>
              )
            }
          }
        }
        return items;
    }

    /**
     * Function that is called whenever the user clicks on the answer question button when viewing a
     * question. Handles changing state so that the answer question form is displayed.
     * @param {Event} event 
     */
    handleAnswerQuestionClick(event){
        this.updateContent("AnswerQuestion");
    }

    /**
     * Function that is called whenever the all questions back button is clicked.
     * @param {Event} event 
     */
    handleAllQuestionsButtonClick(event){
        this.updateContent("QuestionsList");
    }

    /**
     * Update the current offset of questions list.
     * @param {Integer} offset New offset
     */
    updateOffset(offset){
        this.setState({offset: offset});
    }
}

export default QuestionsPage;