import './App.css';
import Header from "./components/Header.js";
import Sidebar from "./components/Sidebar.js";
import QuestionsPage from "./components/QuestionsPage.js";
import React from 'react';
import WelcomePage from "./components/WelcomePage.js";
import Model from "./model.js";
import PostQuestionPage from './components/PostQuestionPage.js';
import TagsPage from "./components/TagsPage.js";
import ProfilePage from "./components/ProfilePage.js"

class Homepage extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {page: "Welcome", fetch: true, authorized: false, user: null, allQuestions: [], questionsList: [], question: undefined};
    this.loadPage = this.loadPage.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updatePageNoFetch = this.updatePageNoFetch.bind(this);
    this.updateAuthorizationState = this.updateAuthorizationState.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updatePageWithQuestion = this.updatePageWithQuestion.bind(this);
    this.updateAllQuestions = this.updateAllQuestions.bind(this);
    this.updateQuestionsList = this.updateQuestionsList.bind(this);
    this.model = new Model();
  }

  componentDidMount(){
      this.model.isLoggedIn().then((result) => {
          this.setState({authorized: true, user: result.data, page: "Questions"});
      }).catch((error) => {});
  }

  render(){
    return (
      <div className="Home">
        <Header page={this.state.page}/>
        <div className='mainContentDiv'>
          <Sidebar updatePage={this.updatePage} authorized={this.state.authorized} updateAuthorizationState={this.updateAuthorizationState} page={this.state.page} updateUser={this.updateUser}/>
          {this.loadPage()}
        </div>
      </div>
    )
  }

  loadPage(){
    if(this.state.page === "Questions"){
      return <QuestionsPage updatePage={this.updatePage} allQuestions={this.state.allQuestions} questionsList={this.state.questionsList} updateAllQuestions={this.updateAllQuestions} updateQuestionsList={this.updateQuestionsList} displayHeader={true} fetchQuestions={this.state.fetch} authorized={this.state.user !== undefined && this.state.user !== null}/>
    }else if(this.state.page === "AskQuestion"){
      return <PostQuestionPage updatePage={this.updatePage} question={this.state.question}/>
    }else if(this.state.page === "Welcome"){
      return <WelcomePage updatePage={this.updatePage} authorized={this.state.authorized} updateAuthorizationState={this.updateAuthorizationState} updateUser={this.updateUser}/> 
    }else if(this.state.page === "Tags"){
      return <TagsPage updatePage={this.updatePageNoFetch} updateQuestionsList={this.updateQuestionsList} updateAllQuestions={this.updateAllQuestions}/>
    }else if(this.state.page === "Profile"){
      return <ProfilePage updatePage={this.updatePageWithQuestion} email={this.state.user.email} updateAuthorizationState={this.updateAuthorizationState} updateUser={this.updateUser}/>
    }
  }

  updateAllQuestions(allQuestions){
    this.setState({allQuestions: allQuestions});
  }

  updateQuestionsList(questionsList){
    this.setState({questionsList: questionsList});
  }

  /**
   * Function to update the page currently being displayed.
   * @param {String} page Questions, Welcome, ...
   */
  updatePage(page){
    this.setState({page: page, question: undefined});
  }

  /**
   * Function to update the page currently being displayed.
   * @param {String} page Questions, Welcome, ...
   * @param {Object} question 
   */
  updatePageWithQuestion(page, question){
    this.setState({page: page, question: question});
  }

  updatePageNoFetch(page){
    this.setState({page: page, fetch: false})
  }

  /**
   * Function to be passed to React componenets to update the authorized state.
   * @param {boolean} authorized
   */
  updateAuthorizationState(authorized){
    this.setState({authorized: authorized})
  }

    /**
   * Function to be passed to React componenets to update the userObj state.
   * @param {Object} user
   */
    updateUser(user){
      this.setState({user: user})
    }
}

export default Homepage;
