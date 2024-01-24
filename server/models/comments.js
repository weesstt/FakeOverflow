// Comment Document Schema
const mongoose = require("mongoose");

var Schema = mongoose.Schema

var CommentSchema = new Schema({
    text: {type: String, required: true},
    user: {type: Object, required: true},
    comment_date_time: {type: Date, required: true},
    votes: {type: Number, default: 0},
    questionID: {type: Schema.Types.ObjectId, required: true}
})

module.exports = mongoose.model("Comment", CommentSchema)