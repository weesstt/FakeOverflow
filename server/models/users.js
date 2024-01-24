// User Document Schema

const mongoose = require("mongoose");

var Schema = mongoose.Schema

var UserSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
    reputation: {type: Number, default: 0},
    date: {type: Date, required: true},
    admin: {type: Boolean, default: false},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
})

module.exports = mongoose.model("User", UserSchema)