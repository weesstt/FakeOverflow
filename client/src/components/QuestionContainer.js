import React from "react";

class QuestionContainer extends React.Component {

    constructor(props){
        super(props);
        this.question = props.question;
        this.handleQuestionClick = props.handleQuestionClick
    }

    render(){
        return (
            <div className='questionDiv'> 
                <div className='answersAndViewsDiv'>
                    <p>{this.question.answers.length + " answers"}</p>
                    <p>{this.question.votes + " votes"}</p>
                    <p>{this.question.views + " views"}</p>
                </div>
                <div>
                    <h1 className='questionTitle' id={this.question._id} onClick={this.handleQuestionClick}>{this.question.title}</h1>
                    <p style={{marginRight: '10px'}}>{this.question.summary}</p>
                    <div className='tagsDiv'>
                        {this.tagItems(this.question.tags)}
                    </div>
                </div>
                <p style={{color: "gray"}}>{this.formatLabel(this.question.user.username, new Date(this.question.ask_date_time), "asked")}</p>
            </div>
        )
    }

    /**
     * Function that returns an array of HTML elements that will display the tags.
     * @returns An array of HTML elements
    */
    tagItems(tags){
        return tags.map((tag) => {
            return (
                <div className='tagDiv' key={crypto.randomUUID}>
                    {tag}
                </div>
            )
        })
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
}

export default QuestionContainer;