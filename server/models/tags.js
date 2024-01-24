// Tag Document Schema

const mongoose = require("mongoose");

var Schema = mongoose.Schema

var TagSchema = new Schema({
    name: {type: String, required: true}
})

TagSchema.virtual("url").get(function() {
    return "posts/tag/" + this._id;
});

module.exports = mongoose.model("Tag", TagSchema)