const QuestionModel = require("../models/questions.js");
const TagController = require("./TagController.js");
const {getAnswerById} = require("./AnswerController.js");
const UserModel = require("../models/users.js");
const CommnetModel = require("../models/comments.js");

/**
 * Function to post question to MongoDB.
 * @param {Object} questionObj 
 */
async function postQuestion(questionObj){
    const title = questionObj.title;
    const text = questionObj.text;
    const user = questionObj.user;
    const summary = questionObj.summary;

    const filterTags = [];
    questionObj.tags.forEach(element => {
        if(!(filterTags.includes(element))) filterTags.push(element);
    });

    const tags = [];
    for(let tagName of filterTags){
        let tagID = await TagController.getTagId(tagName, questionObj.user);
        tags.push(tagID);
    }

    var question = new QuestionModel({
        title: title,
        text: text,
        tags: tags,
        user: user,
        summary: summary,
        ask_date_time: new Date()
    });

    return new Promise((resolve, reject) => {
        question.save().then((result) => {
            let id = result._id;
            UserModel.findOneAndUpdate({email: user.email}, {$push: {questions: id}}).then(() => {
                resolve("Success");
            }).catch((error) => {
                reject("Server error, please try again.");
            })
            resolve("Success");
        }).catch((error) => {
            reject("Server error, please try again.");
        })
    })
}

/**
 * Function that retrieves the question associated with the provided questionId.
 * @param {Objectid} questionId 
 * @returns {Object} The object that represents the question.
 */
async function getQuestionById(questionId){
    let question = await QuestionModel.findById(questionId);
    
    let questionObj = {
        title: question.title,
        text: question.text,
        _id: question._id,
        ask_date_time: question.ask_date_time,
        views: question.views,
        votes: question.votes,
        user: question.user,
        summary: question.summary
    }

    let answers = [];
    for(let answerID of question.answers){
        let answer = await getAnswerById(answerID);
        answers.push(answer);
    }
    questionObj.answers = answers;

    let tags = [];
    for(let tagID of question.tags){
        let tag = await TagController.getTag(tagID);
        tags.push(tag.name);
    }
    questionObj.tags = tags;

    let comments = [];
    for(let commentID of question.comments){
        let comment = await CommnetModel.findById(commentID);
        comments.push(comment);
    }

    questionObj.comments = comments;

    return questionObj;
}

/**
 * Function to retrieve all questions from the database.
 * Used in the getAllQuestionsSorted functions and then sorts respectively. In a production model
 * this would not be efficient and would have to be changed so that you could only query 
 * the server for 5 questions at a time, response would tell you if there is another page of questions
 * that you can view or if you can go back a page. 
 * @returns Promise that resolves with the result of getting all questions.
 */
async function getAllQuestions(){
    let questions = [];
    for(let question of await QuestionModel.find()){
        let questionObj = {
            title: question.title,
            text: question.text,
            _id: question._id,
            ask_date_time: question.ask_date_time,
            views: question.views,
            votes: question.votes,
            user: question.user,
            summary: question.summary
        }

        let answers = [];
        for(let answerID of question.answers){
            let answer = await getAnswerById(answerID);
            answers.push(answer);
        }
        questionObj.answers = answers;

        let tags = [];
        for(let tagID of question.tags){
            let tag = await TagController.getTag(tagID);
            tags.push(tag.name);
        }
        questionObj.tags = tags;

        let comments = [];
        for(let commentID of question.comments){
            let comment = await CommnetModel.findById(commentID);
            comments.push(comment);
        }
    
        questionObj.comments = comments;
        
        questions.push(questionObj)
    }
    return questions;
}

/**
 * Function that increments the view count in mongo of the associated question 
 * @param {ObjectId} questionID Object ID of the question
 * @returns Promise that resolves to the result of updating object in mongo.
 */
function incrementViewCount(questionID){
    return new Promise((resolve, reject) => {
        QuestionModel.findById(questionID).then((question) => {
            QuestionModel.findByIdAndUpdate(questionID, {views: question.views + 1}).then(() => {
                resolve("Success");
            }).catch(() => {
                reject("Server error");
            })
        }).catch(() => {
            reject("Server error");
        })
    });
}

/**
 * Function to update question in MongoDB.
 * @param {Object} questionObj 
 */
async function updateQuestion(questionObj){
    const title = questionObj.title;
    const text = questionObj.text;
    const summary = questionObj.summary;

    const filterTags = [];
    questionObj.tags.forEach(element => {
        if(!(filterTags.includes(element))) filterTags.push(element);
    });

    const tags = [];
    for(let tagName of filterTags){
        let tagID = await TagController.getTagId(tagName, questionObj.user);
        tags.push(tagID);
    }

    return QuestionModel.findByIdAndUpdate(questionObj._id, {
        title: title,
        text: text,
        summary: summary,
        tags: tags
    })
}

/**
 * Remove the specified tag from each of the specified questions.
 * @param {*} tagID Tag to be removed
 * @param {*} questionIDs The ids of questions to remove tag from
 */
async function removeTagFromQuestions(tagID, questionIDs){
    for(const questionID of questionIDs){
        console.log("removing " + tagID + " from " + questionID);
        await QuestionModel.findByIdAndUpdate(questionID, {$pull: {tags: tagID}});
    }
}

async function getQuestionByAnswerID(answerID){
    let questions = await QuestionModel.find();
    const question = questions.find((filter) => {
        return filter.answers.includes(answerID);
    })

    let questionObj = {
        title: question.title,
        text: question.text,
        _id: question._id,
        ask_date_time: question.ask_date_time,
        views: question.views,
        votes: question.votes,
        user: question.user,
        summary: question.summary
    }

    let answers = [];
    for(let answerID of question.answers){
        let answer = await getAnswerById(answerID);
        answers.push(answer);
    }
    questionObj.answers = answers;

    let tags = [];
    for(let tagID of question.tags){
        let tag = await TagController.getTag(tagID);
        tags.push(tag.name);
    }
    questionObj.tags = tags;

    let comments = [];
    for(let commentID of question.comments){
        let comment = await CommnetModel.findById(commentID);
        comments.push(comment);
    }

    questionObj.comments = comments;
    return questionObj;
}

async function upvoteQuestion(questionID){
    const question = await QuestionModel.findById(questionID);
    await QuestionModel.findByIdAndUpdate(questionID, {votes: question.votes + 1});
    const user = await UserModel.findOne({email: question.user.email});
    await UserModel.findByIdAndUpdate(user._id, {reputation: user.reputation + 5});
}

async function downvoteQuestion(questionID){
    const question = await QuestionModel.findById(questionID);
    await QuestionModel.findByIdAndUpdate(questionID, {votes: question.votes - 1});
    const user = await UserModel.findOne({email: question.user.email});
    await UserModel.findByIdAndUpdate(user._id, {reputation: user.reputation - 10});
}


exports.updateQuestion = updateQuestion;
exports.postQuestion = postQuestion;
exports.getQuestionById = getQuestionById;
exports.getAllQuestions = getAllQuestions;
exports.incrementViewCount = incrementViewCount;
exports.removeTagFromQuestions = removeTagFromQuestions
exports.getQuestionByAnswerID = getQuestionByAnswerID
exports.upvoteQuestion = upvoteQuestion;
exports.downvoteQuestion = downvoteQuestion;
