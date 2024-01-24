import React from "react"
import Model from "../model.js"

class SearchBar extends React.Component {

    constructor(props){
        super(props)
        this.state = {input: ""}
        this.updateQuestionsList = props.updateQuestionsList;
        this.updateAllQuestions = props.updateAllQuestions;
        this.searchInputEvent = this.searchInputEvent.bind(this);
        this.model = new Model();
    }

    render(){
        return (
            <input type="text" id="SearchBar" placeholder="Search . . ." className="searchBar" onKeyUp={this.searchInputEvent}/>
        )
    }

    searchInputEvent(event){
      if(event.keyCode !== 13) return;
      this.model.getAllQuestions().then((questions) => {
          const input = event.target.value;
          if(input.replaceAll(" ", "").length === 0 || input.length === 0) return;
          const result = [];
          let words = [];
          let tags = input.match(/\[+.([a-z]|[A-Z]|[0-9]|-)+\]+/g);
          let inputStream = input.split(" ");
          if(tags !== null){
            for(let token of inputStream){
              let push = true;
              for(let tag of tags){
                if(tag === token){
                  push = false;
                  break;
                }
                token = token.replace(tag, "");
              }
              if(push) words.push(token);
            }
            tags = tags.map((tag) => { return tag.replace(/\]/g, "").replace(/\[/g, "").replace(" ", "").toLowerCase();});
          }else{
            inputStream.forEach(element => {
              words.push(element);
            });
          }
        
          words = words.filter((word) => {return word.length !== 0});

          questions.forEach((question) => {
              let added = false;
              words.forEach((word) => {
                  if(question.text.includes(word)){
                      result.push(question)
                      added = true;
                      return;
                  }
              })

              if(!added){
                  if(!tags) return;
                  tags.forEach((tag) => {
                      if(question.tags.includes(tag)){
                          result.push(question);
                          return;
                      }
                  })
              }
          })
        
          this.updateAllQuestions(result);
          this.updateQuestionsList(result.slice(0, 5))
      })
    }
}

export default SearchBar