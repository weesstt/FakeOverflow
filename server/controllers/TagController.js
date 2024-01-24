const TagModel = require("../models/tags.js");
const QuestionModel = require("../models/questions.js")
const QuestionController = require("./QuestionController.js");
const UserModel = require("../models/users.js")
const { Schema } = require("mongoose");

/**
 * Given a tagID, retrieve associated tag object from MongoDB.
 * @param {ObjectId} tagID 
 * @returns {Object} Promise that resolves to object representing tag data.
 */
function getTag(tagID){
    return new Promise((resolve, reject) => {
        TagModel.findById(tagID).then((result) => {
            resolve(result);
        }).catch((error) => {
            reject("Server error, please try again!");
        });
    });
}

/**
 * Given a tag name, retrieve the ID for the tag. If there is no tag in the database,
 * then the tag will be created and the newly generated ID will be returned.
 * @param {String} tagName 
 * @returns {Object} Promise that resolves to object representing tag data.
 */
function getTagId(tagName, user){
    return new Promise((resolve, reject) => {
        TagModel.find({name: tagName}).then((result) => {
            if(result.length === 0){//save new tag and return the new id
                UserModel.findOne({email: user.email}).then((result) => {
                    if(result.reputation < 50 && user.admin !== true){
                        reject("Only users with a reputation higher than 50 can create a new tag!");
                    }else{
                        const tag = new TagModel({
                            name: tagName
                        })
                        tag.save().then((result) => {
                            UserModel.findOneAndUpdate({email: user.email}, {$push: {tags: result._id}}).then(() => {
                                resolve(result._id)
                            }).catch((error) => {
                                console.log(error);
                                resolve(result._id) //resolve in either case because tag has already been added
                            });
                        }).catch((error) => {
                            reject(error);
                        })
                    }
                })
            }else{
                resolve(result[0]._id);
            }
        }).catch((error) => {
            reject(error);
        });
    })
}

/**
 * Get all tags from MongoDB
 * @returns A promise that resolves to the result of the mongoDB query. 
 */
async function getAllTags(){
    let questions = await QuestionController.getAllQuestions();
    let tags = await TagModel.find();
    let result = [];
    for(let tag of tags){
        let obj = {name: tag.name, questions: [], _id: tag._id};
        result.push(obj);
    }

    for(let question of questions){
        for(let tag of result){
            if(question.tags.includes(tag.name)){
                tag.questions.push(question);
            }
        }
    }
  
    return result;
}

exports.getTag = getTag;
exports.getTagId = getTagId;
exports.getAllTags = getAllTags;
