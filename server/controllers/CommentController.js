const { Schema } = require("mongoose");
const AnswerModel = require("../models/answers.js");
const QuestionModel = require("../models/questions.js");
const UserModel = require("../models/users.js")
const CommentModel = require("../models/comments.js")

async function postComment(questionID, comment, user, date){
    const commentModel = new CommentModel({
        text: comment,
        comment_date_time: date,
        questionID: questionID,
        user: user
    })

    let commentResult = await commentModel.save();
    await QuestionModel.findByIdAndUpdate(questionID, {$push: {comments: commentResult._id}});
    await UserModel.findOneAndUpdate({email: user.email}, {$push: {comments: commentResult._id}})
    return commentResult;
}

async function upvoteComment(commentID){
    const comment = await CommentModel.findById(commentID);
    await CommentModel.findByIdAndUpdate(commentID, {votes: comment.votes + 1});
}

async function removeQuestionCommentsFromUsers(questionObj){
    for(let commentID of questionObj.comments){
        let comment = await CommentModel.findById(commentID);
        await UserModel.findOneAndUpdate({email: comment.user.email}, {$pull: {comments: commentID}});
        await CommentModel.findByIdAndDelete(commentID);
    }
}

exports.postComment = postComment;
exports.upvoteComment = upvoteComment;
exports.removeQuestionCommentsFromUsers = removeQuestionCommentsFromUsers