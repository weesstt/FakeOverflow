// Answer Document Schema
const mongoose = require("mongoose");

var Schema = mongoose.Schema

var AnswerSchema = new Schema({
    text: {type: String, required: true},
    user: {type: Object, required: true},
    ans_date_time: {type: Date, required: true},
    votes: {type: Number, default: 0},
    questionID: {type: Schema.Types.ObjectId, required: true}
})

AnswerSchema.virtual("url").get(function() {
    return "posts/answer/" + this._id;
});

module.exports = mongoose.model("Answer", AnswerSchema)
