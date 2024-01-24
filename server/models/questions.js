const mongoose = require("mongoose");
const AnswerModel = require("./answers.js")
// Question Document Schema
var Schema = mongoose.Schema

var QuestionSchema = new Schema({
    title: {type: String, required: true, maxLength: 100},
    text: {type: String, required: true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true, minItems: 1}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    ask_date_time: {type: Date, required: true}, 
    views: {type: Number, default: 0},
    votes: {type: Number, default: 0},
    user: {type: Object, required: true},
    summary: {type: String, required: true, minLength: 1, maxLength: 140}
})

QuestionSchema.virtual("url").get(function() {
    return "posts/question/" + this._id;
});

QuestionSchema.virtual("recentAnsDate").get(async function() {
    model = mongoose.model("Question", QuestionSchema)
    if(this.answers.length == 0){
        return undefined;
    }else{
        let ansDates = []
        for(let aid of this.answers){
            let answer = await AnswerModel.findById(aid).exec();
            ansDates.push(new Date(answer.ans_date_time));
        }

        let newest = ansDates[0];
        for(let date of ansDates){
            newest = date > newest ? date : newest;
        }
        return newest;
    }
});

module.exports = mongoose.model("Question", QuestionSchema)


