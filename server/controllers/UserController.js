const { Schema } = require("mongoose");
const UserModel = require("../models/users.js");
const bcrypt = require("bcrypt");
const QuestionModel = require("../models/questions.js");
const AnswerModel = require("../models/answers.js")
const CommentModel = require("../models/comments.js")

/**
 * Create user and save to database.
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 * @param {Date} date
 * @returns Promise with results of hashing password and saving to database.
 */
async function createUser(username, email, password, date){
    let results = await UserModel.find({email: email});
    return new Promise((resolve, reject) => {
        if(results.length === 0){
            const saltRounds = 10;

            bcrypt.genSalt(saltRounds).then((salt) => {
                bcrypt.hash(password, salt).then((passwordHash) => {
                    var user = new UserModel({
                        username: username,
                        email: email,
                        password: passwordHash,
                        date: date,
                    });

                    user.save().then((result) => {
                        resolve("Success");
                    }).catch((error) => {
                        reject("Server save error, please try again.");
                    });

                }).catch(() => {reject("Server hash error, please try again.")});
            }).catch(() => {reject("Server salt error, please try again.")});
        }else{
            reject("A user with that email already exists");
        }
    });
}

/**
 * Function that checks user credentials.
 * @param {String} email 
 * @param {String} password 
 * @returns True or false if user is authenticated.
 */
async function loginUser(email, password){
    let results = await UserModel.find({email: email});
    return new Promise((resolve, reject) => {
        if(results.length !== 0){
            const user = results[0];
            const email = user.email;
            const passwordHash = user.password;

            const userObj = {
                email: email,
                username: user.username,
                admin: user.admin
            }

            bcrypt.compare(password, passwordHash).then((result) => {
                if(result){
                    resolve(userObj);
                }else{
                    reject("Incorrect username or password.");
                }
            }).catch((error) => {
                reject("Server hash error.");
            })
        }else{
            reject("Incorrect username or password.");
        }
    });
}

/**
 * Function that gets the user's reputation from mongoDB
 * @param {String} userEmail The email of the specific user to get the reputation for.
 * @returns A promise that resolves to the reputation of the specified user.
 */
async function getUserObj(userEmail){
    let results = await UserModel.find({email: userEmail});
    return new Promise((resolve, reject) => {
        if(results.length !== 0){
            const user = results[0];
            const userObj = {
                username: user.username,
                email: user.email,
                reputation: user.reputation,
                questions: user.questions,
                date: user.date,
                tags: user.tags,
                answers: user.answers,
                admin: user.admin
            }
            resolve(userObj);
        }else{
            reject("No user found!");
        }
    });
}

/**
 * Function that updates MongoDB to remove the question from the user object. 
 * @param {Schema.Types.ObjectId} questionID Question ID to be removed from user. 
 * @param {Object} user Object representing user, must have the user email
 */
async function removeQuestionFromUser(questionID, user){
    let results = await UserModel.find({email: user.email});
    return new Promise((resolve, reject) => {
        if(results.length !== 0){
            const userID = results[0]._id;
            UserModel.findByIdAndUpdate(userID, {$pull: {questions: questionID}}).then(() => {
                resolve("Success");
            }).catch((error) => {
                reject(error);
            });
        }else{
            reject("No user found!");
        }
    });
}

async function getAllUsers(){
    let users = await UserModel.find();
    return users;
}

async function deleteAnswer(answerID){
    let answer = await AnswerModel.findById(answerID);
    await UserModel.findOneAndUpdate({email: answer.user.email}, {$pull: {answers: answerID}});
}

async function deleteUser(userEmail){
    let user = await UserModel.findOne({email: userEmail});
    for(let questionID of user.questions){
        let question = await QuestionModel.findById(questionID);
        for(let answerID of question.answers){
            await deleteAnswer(answerID);
        }
        await QuestionModel.findByIdAndDelete(questionID);
    }

    for(let answerID of user.answers){
        let answer = await AnswerModel.findById(answerID);
        await QuestionModel.findByIdAndUpdate(answer.questionID, {$pull: {answers: answer._id}});
        await AnswerModel.findByIdAndDelete(answerID);
    }

    for(let commentID of user.comments){
        let comment = await CommentModel.findById(commentID);
        await QuestionModel.findByIdAndUpdate(comment.questionID, {$pull: {comments: comment._id}});
        await CommentModel.findByIdAndDelete(commentID);
    }

    await UserModel.findOneAndDelete({email: userEmail});

}

exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getUserObj = getUserObj
exports.removeQuestionFromUser = removeQuestionFromUser;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;