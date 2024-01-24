import React from "react";
import Model from "../model.js"

class QuestionDetails extends React.Component {
    constructor(props){
        super(props);
        this.question = props.question;
        this.handleAllQuestionsButtonClick = props.handleAllQuestionsButtonClick;
        this.displayBackButton = props.displayBackButton !== undefined ? props.displayBackButton : true;
        this.handleAnswerQuestionClick = props.handleAnswerQuestionClick;

        this.user = props.user;
        this.handleEditAnswer = props.handleEditAnswer;
        this.handleDownvote = this.handleDownvote.bind(this);
        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleAnswerUpvote = this.handleAnswerUpvote.bind(this);
        this.handleAnswerDownvote = this.handleAnswerDownvote.bind(this);
        this.handleNavigationButton = this.handleNavigationButton.bind(this);
        this.handleCommentInput = this.handleCommentInput.bind(this);
        this.loadAnswers = this.loadAnswers.bind(this);
        this.loadComments = this.loadComments.bind(this);
        this.handleCommentUpvote = this.handleCommentUpvote.bind(this);
        this.hanldeCommentNavigationButton = this.hanldeCommentNavigationButton.bind(this);
        this.model = new Model();
        this.authorized = props.authorized;

        this.question.answers.sort((a, b) => {
          return new Date(a.ans_date_time) < new Date(b.ans_date_time); 
        })

        this.question.comments.sort((a, b) => {
          return (new Date(a.comment_date_time)) < (new Date(b.comment_date_time));
        })

        if(this.user !== undefined){//push user answers to top
          this.question.answers.sort((a, b) => {
              if(a.user.email === this.user.email && b.user.email !== this.user.email){
                  return -1;
              }else if(a.user.email !== this.user.email && b.user.email === this.user.email){
                  return 1;
              }else{
                return new Date(a.ans_date_time) < new Date(b.ans_date_time);
              }
          })
      }
      this.state = {allAnswers: this.question.answers, 
        visibleAnswers: this.question.answers.slice(0, 5), 
        offset: 0, allComments: this.question.comments, 
        visibleComments: this.question.comments.slice(0, 3),
        commentOffset: 0}
    }

    render(){
        return (
            <div>
                <div className="questionViewDiv">
                    <div className="questionViewHeaderDiv">
                        <div style={{display: "flex", flexDirection: "row", marginBottom: "30px"}}>
                            {this.displayBackButton ? <button className="actionButton" style={{marginRight: "60vw"}} onClick={this.handleAllQuestionsButtonClick}>{"< All Questions"}</button> : null}
                        </div>
                        
                        <h2 style={{marginLeft: '80px', paddingRight: '70px', width: '50vw', textWrap: 'wrap', wordBreak: 'break-all', maxWidth: '50vw'}}>{this.question.title}</h2>
                        <div style={{display: 'inline', width: '50vw', alignItems: 'center', wordBreak: 'break-all', marginLeft: "175px"}}>
                        {this.formatText(this.question.text)}
                        </div>
                        <p style={{paddingLeft: '70px'}}>
                            <font color="red">
                                {this.question.user.username}
                            </font>
                            <br/>
                            {this.formatLabel("", new Date(this.question.ask_date_time), "asked")}
                        </p>
                        {(this.user === undefined || this.user === null) && this.authorized === true ? 
                          <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
                            <button className="actionButton" style={{marginRight: '10px'}} id={this.question._id} onClick={this.handleUpvote}>Upvote</button>
                            <button className="actionButton" id={this.question._id} onClick={this.handleDownvote}>Downvote</button>
                          </div> : null
                        }
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", marginLeft: "80px"}}>
                            <h3 style={{marginRight: '40px', color: 'gray'}}>{this.question.answers.length + " Answers"}</h3>
                            <h3 style={{marginRight: '40px', color: 'gray'}}>{this.question.views + " Views"}</h3>
                            <h3 style={{marginRight: '40px', color: 'gray'}}>{this.question.votes + " Votes"}</h3>
                        </div>
                    </div>
                    <div className="questionComments"> 
                      {this.loadComments()}
                      {this.state.allComments.length > 3 ? 
                        <div className="pageButtonContainer" style={{marginBottom: '10px'}}>
                            <button className="pageButton" id="prev" onClick={this.hanldeCommentNavigationButton}>Prev</button>
                            <button className="pageButton" id="next" onClick={this.hanldeCommentNavigationButton}>Next</button>
                        </div> : null}
                    </div>
                    {(this.user === undefined || this.user === null) && this.authorized === true ? <input className="commentInput" placeholder="Leave a comment" onKeyDown={this.handleCommentInput}></input>
                       : null
                    }
                    <div className="answersViewDiv">
                        {this.loadAnswers()}
                    </div>
                    {this.state.allAnswers.length > 5 ? 
                        <div className="pageButtonContainer" style={{marginBottom: '10px'}}>
                            <button className="pageButton" id="prev" onClick={this.handleNavigationButton}>Prev</button>
                            <button className="pageButton" id="next" onClick={this.handleNavigationButton}>Next</button>
                        </div> : null}
                    {this.authorized ? <button className="actionButton" style={{marginTop: '5px', marginBottom: '20px'}} onClick={this.handleAnswerQuestionClick}>Answer Question</button> : null}
                </div>
            </div>
        );
    }

    loadComments(){
      var comments = this.state.visibleComments.slice();
      console.log(this.state.visibleComments);
      return comments.map((comment) => {
          return (
          <div className="answerDiv" key={comment._id}>
              <p style={{marginTop: '20px', marginRight: '20px', fontSize: '17px', color: "lightgray"}}>{comment.votes + " votes"}</p>
              {this.formatText(comment.text)}
              <p style={{paddingLeft: '70px'}}>
                  <font color="gray">{comment.user.username}</font>
                  <br />
                  {this.formatLabel("", new Date(comment.comment_date_time), "commented")}
              </p>
              {(this.user === undefined || this.user === null) && this.authorized === true ? 
                <div style={{display: 'flex', flexDirection: 'row', margin: 'auto'}}>
                  <button className="actionButton" style={{margin: '20px'}} id={comment._id} onClick={this.handleCommentUpvote}>Upvote</button>
                </div> : null
              }
          </div>)
      })
    }

    handleUpvote(event){
      this.model.upvoteQuestion(event.target.id).then(() => {
        this.question.votes = this.question.votes + 1;
        this.forceUpdate();
      }).catch((error) => {
        alert(error.response.data);
      })
    }

    handleDownvote(event){
      this.model.downvoteQuestion(event.target.id).then(() => {
        this.question.votes = this.question.votes - 1;
        this.forceUpdate()
      }).catch((error) => {
        alert(error.response.data);
      })
    }

    handleCommentInput(event){
      if(event.keyCode !== 13) return;
      if(event.target.value.length === 0) return;
      if(event.target.value.length > 140) return alert("Comments must be less than 140 characters!");
      const comment = event.target.value;
      this.model.postComment(this.question._id, comment).then((result) => {
        this.question.comments.push(result);
        this.question.comments.sort((a, b) => {
          return (new Date(a.comment_date_time)) < (new Date(b.comment_date_time));
        })
        event.target.value = "";
        this.setState({allComments: this.question.comments, visibleComments: this.question.comments.slice(0, 3)})
      }).catch((error) => {
        alert(error);
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
     * Function that transforms an array of answers into an array of HTML elements to be displayed.
     * @param {Array<Object>} answers Array of objects representing answers.
     * @returns An array of HTML elements representing answers.
     */
    loadAnswers(){
        var answers = this.state.visibleAnswers.slice();

        return answers.map((answer) => {
            return (
            <div className="answerDiv" key={answer._id}>
                <p style={{marginTop: '20px', marginRight: '20px', fontSize: '17px', color: "lightgray"}}>{answer.votes + " votes"}</p>
                {this.formatText(answer.text)}
                <p style={{paddingLeft: '70px'}}>
                    <font color="green">{answer.user.username}</font>
                    <br />
                    {this.formatLabel(answer.user.username, new Date(answer.ans_date_time), "answered")}
                </p>
                {this.user !== undefined && answer.user.email === this.user.email ? <button style={{margin: '20px'}} className="actionButton" id={answer._id} onClick={this.handleEditAnswer}>Edit Answer</button> : null}
                {(this.user === undefined || this.user === null) && this.authorized === true ? 
                  <div style={{display: 'flex', flexDirection: 'row', margin: 'auto'}}>
                    <button className="actionButton" style={{margin: '20px'}} id={answer._id} onClick={this.handleAnswerUpvote}>Upvote</button>
                    <button className="actionButton" style={{margin: '20px'}} id={answer._id} onClick={this.handleAnswerDownvote}>Downvote</button>
                  </div> : null
                }
            </div>)
        })
    }

    /**
     * Function that is called whenever the prev or next buttons are clicked.
     * Handles updating the questions to display array and the current page.
     * @param {Event} event 
     */
    handleNavigationButton(event){
      if(event.target.id === "prev"){
          if(this.state.offset === 0) return;
          this.setState({offset: this.state.offset - 1, visibleAnswers: this.state.allAnswers.slice((this.state.offset - 1) * 5, ((this.state.offset - 1) * 5) + 5)});
      }else{//next
          if(this.state.offset * 5 + 5 >= this.state.allAnswers.length) return;
          this.setState({offset: this.state.offset + 1, visibleAnswers: this.state.allAnswers.slice((this.state.offset + 1) * 5, ((this.state.offset + 1) * 5) + 5)});
      }
   }

    handleAnswerUpvote(event){
      this.model.upvoteAnswer(event.target.id).then(() => {
        var answerObj = null;
        this.question.answers = this.question.answers.filter((a) => {
          if(a._id === event.target.id) answerObj = a;
          return a._id !== event.target.id;
        })
        answerObj.votes = answerObj.votes + 1;
        this.question.answers.push(answerObj);
        this.forceUpdate();
      }).catch((error) => {
        alert(error.response.data);
      })
    }

    handleAnswerDownvote(event){
      this.model.downvoteAnswer(event.target.id).then(() => {
        var answerObj = null;
        this.question.answers = this.question.answers.filter((a) => {
          if(a._id === event.target.id) answerObj = a;
          return a._id !== event.target.id;
        })
        answerObj.votes = answerObj.votes - 1;
        this.question.answers.push(answerObj);
        this.forceUpdate();
      }).catch((error) => {
        alert(error.response.data);
      })
    }

    handleCommentUpvote(event){
      const commentID = event.target.id;
      this.model.upvoteComment(commentID).then(() => {
        var commentObj = null;
        this.question.comments = this.question.comments.filter((c) => {
          if(c._id === event.target.id) commentObj = c;
          return c._id !== event.target.id;
        })
        commentObj.votes = commentObj.votes + 1;
        this.question.comments.push(commentObj);
        this.forceUpdate();
      }).catch((error) => {
        alert(error);
      })
    }

    hanldeCommentNavigationButton(event){
      if(event.target.id === "prev"){
        console.log(this.state.commentOffset);
        if(this.state.commentOffset === 0) return;
        this.setState({commentOffset: this.state.commentOffset - 1, visibleComments: this.state.allComments.slice((this.state.commentOffset - 1) * 3, ((this.state.commentOffset - 1) * 3) + 3)});
      }else{//next
        if(this.state.commentOffset * 3 + 3 >= this.state.allComments.length) return;
        this.setState({commentOffset: this.state.commentOffset + 1, visibleComments: this.state.allComments.slice((this.state.commentOffset + 1) * 3, ((this.state.commentOffset + 1) * 3) + 3)});
      }
    }

}   

export default QuestionDetails 