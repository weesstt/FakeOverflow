const { Schema } = require("mongoose");
const AnswerModel = require("../models/answers.js");
const QuestionModel = require("../models/questions.js");
const UserModel = require("../models/users.js")

/**
 * Function to save answer to MongoDB.
 * @param {Object} answerObj 
 */
function postAnswer(answerObj){
    return new Promise((resolve, reject) => {
        let newAnswer = new AnswerModel(
            {text: answerObj.text, user: answerObj.user, ans_date_time: answerObj.ans_date_time, questionID: answerObj.questionID}
        );

        newAnswer.save().then((answer) => {
            QuestionModel.findByIdAndUpdate(answerObj.questionID, {$push: {answers: answer._id}}).then(() => {
                UserModel.findOneAndUpdate({email: answerObj.user.email}, {$push: {answers: answer._id}}).then(() => {
                    resolve(answer);
                }).catch((error) => {
                    reject("Server error");
                })
            }).catch((error) => {
                reject("Server error");
            })
        }).catch((error) => {
            reject("Server error");
        });
    });
}

/**
 * Function to get the answer in the database with an associated id.
 * @param {ObjectId} answerID Corresponding MongoDB answer ID.
 * @returns {Object} Object representing the answer.
 */
function getAnswerById(answerID){
    return new Promise((resolve, reject) => {
        AnswerModel.findById(answerID).then((result) => {
            resolve(result);
        }).catch((error) => {
            reject("Server error, please try again!");
        });
    })
}

/**
 * Removes ansIDs from users who are in the answers array of the specified question object
 * @param {*} questionObj Object representing the question.
 */
async function removeAnswersFromUsers(questionObj){
    for(const ansID of questionObj.answers){
        let answer = await getAnswerById(ansID);
        console.log(answer);
        await UserModel.findOneAndUpdate({email: answer.user.email}, {$pull: {answers: ansID}})
    }
}

async function updateAnswer(answerID, answerText){
    let result = await AnswerModel.findByIdAndUpdate(answerID, {text: answerText});
    return result;
}

async function deleteAnswer(answerID, questionID, userEmail){
    await QuestionModel.findByIdAndUpdate(questionID, {$pull: {answers: answerID}});
    await UserModel.findOneAndUpdate({email: userEmail}, {$pull: {answers: answerID}});
    await AnswerModel.findByIdAndDelete(answerID);
}

async function upvoteAnswer(answerID){
    const answer = await AnswerModel.findById(answerID);
    await AnswerModel.findByIdAndUpdate(answerID, {votes: answer.votes + 1});
    const user = await UserModel.findOne({email: answer.user.email});
    await UserModel.findByIdAndUpdate(user._id, {reputation: user.reputation + 5});
}

async function downvoteAnswer(answerID){
    const answer = await AnswerModel.findById(answerID);
    await AnswerModel.findByIdAndUpdate(answerID, {votes: answer.votes - 1});
    const user = await UserModel.findOne({email: answer.user.email});
    await UserModel.findByIdAndUpdate(user._id, {reputation: user.reputation - 10});
}


exports.getAnswerById = getAnswerById;
exports.postAnswer = postAnswer;
exports.removeAnswersFromUsers = removeAnswersFromUsers;
exports.updateAnswer = updateAnswer;
exports.deleteAnswer = deleteAnswer;
exports.upvoteAnswer = upvoteAnswer;
exports.downvoteAnswer = downvoteAnswer;