import React from "react";
import Model from "../model.js"

class TagsPage extends React.Component {

    constructor(props){
        super(props);

        this.updatePage = props.updatePage;
        this.model = new Model();
        this.state = {tags: [], content: "Tags"}
        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleDeleteTag = this.handleDeleteTag.bind(this);
        this.updateAllQuestions = props.updateAllQuestions;
        this.updateQuestionsList = props.updateQuestionsList;
        this.tags = props.tags;
        this.model = new Model();
    }

    componentDidMount(){
        if(this.tags === undefined){
            this.model.getAllTags().then((result) => {
                this.setState({tags: result})
            }).catch((error) => {
                alert("A server error occured. Please reload the page and try again!")
            })
        }else{
            this.model.getAllTags().then((result) => {
                this.setState({tags: result.filter((tag) => {
                    return this.tags.includes(tag._id);
                })})
            }).catch((error) => {
                alert("A server error occured. Please reload the page and try again!")
            })
        }
    }

    render(){
        return (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '84vw'}}>
            <div className="tagsHeader">
                <h1>Tags</h1>
                <p>{this.state.tags.length + " Tags"}</p>
            </div>
            <div className="tagContentDiv">
                {this.tagItems()}
            </div>
        </div>)
    }

    /**
     * Function that handles whenever the delete button on a tag is clicked.
     */
    handleDeleteTag(event){
        this.model.deleteTag(event.target.id).then(() => {
            this.setState({
                tags: this.state.tags.filter((tag) => {
                    return tag._id !== event.target.id;
                })
            })
        }).catch((error) => {
            alert(error);
        })
    }

    /**
     * Function that returns an array of HTML objects to display tags.
     * @returns HTML element
     */
    tagItems(){
        return this.state.tags.map((tag) => {
            return (
                <div className="tagDisplayDiv" key={crypto.randomUUID()}> 
                    <p>{tag.name}</p>
                    {this.loadTagContent(tag)}
                </div>
            )
        })
    }

    /**
     * Function that correctly displays questions link or edit/delete button based on if
     * the tags prop was defined.
     * @param {Object} tag Object representing tag
     */
    loadTagContent(tag){
        if(this.tags === undefined){
            return (<p className="tagLabel" id={tag.name} onClick={this.handleTagClick}>{tag.questions.length + " Questions"}</p>)
        }else{
            return (
                <div>
                    <p id={tag.name} onClick={this.handleTagClick}>{tag.questions.length + " Questions"}</p>
                    <button className="actionButton" onClick={this.handleDeleteTag} id={tag._id}>Delete</button>
                </div>
            )
        }
    }

    /**
     * Function that is called whenever a tag name is clicked. 
     * @param {*} event 
     */
    handleTagClick(event){
        if(this.tags === undefined){
            let tagName = event.target.id;
            let tagObj = this.state.tags.find((tag) => {
                return tag.name === tagName;
            })

            this.updateAllQuestions(tagObj.questions);
            this.updateQuestionsList(tagObj.questions.slice(0, 5));
            this.updatePage("Questions");
        }
    }
    
}

export default TagsPage;