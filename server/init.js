let TagModel = require('./models/tags')
let AnswerModel = require('./models/answers')
let QuestionModel = require('./models/questions')
let CommentModel = require("./models/comments")
let UserModel = require("./models/users")
const bcrypt = require("bcrypt")

if(process.argv.length !== 4){
    console.log("Incorrect arguments!");
    console.log("Correct usage: node init.js <adminUsername> <adminPassword>");
    process.exit(0);
}

let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createTag(tagName){
    return (new TagModel(
        {name: tagName}
    )).save();
}

async function createAnswer(text, user, question){
    const answer = await AnswerModel({
        user: {email: user.email, username: user.username, admin: user.admin},
        text: text,
        ans_date_time: new Date(),
        questionID: question._id
    }).save()
    await QuestionModel.findByIdAndUpdate(question._id, {$push: {answers: answer._id}});
    await UserModel.findByIdAndUpdate(user._id, {$push: {answers: answer._id}})
    return answer;
}

async function createQuestion(title, summary, text, tags, user){
    const question = await QuestionModel({
        title: title,
        text: text,
        summary: summary,
        tags: tags,
        user: {email: user.email, username: user.username, admin: user.admin},
        ask_date_time: new Date()
    }).save()
    await UserModel.findByIdAndUpdate(user._id, {$push: {questions: question._id}})
    return question;
}

const populate = async () => {
    //Create admin user
    const saltRounds = 10;
    const adminUsername = process.argv[2]
    const adminPassword = process.argv[3]

    let salt = await bcrypt.genSalt(saltRounds);
    let passwordHash = await bcrypt.hash(adminPassword, salt);
    var adminUser = new UserModel({
        username: adminUsername,
        email: adminUsername + "@fakeoverflow.com",
        password: passwordHash,
        date: new Date(),
        admin: true
    });

    let user = await adminUser.save();

    let t1 = await createTag('react');
    let t2 = await createTag('javascript');
    let t3 = await createTag('android-studio');
    let t4 = await createTag('shared-preferences');

    let question1 = await createQuestion("Question 1 Title", "Question 1 Summary", "Question 1 Text", [t1, t2], user);
    let question2 = await createQuestion("Question 2 Title", "Question 2 Summary", "Question 2 Text", [t3, t4], user);

    await createAnswer('Admin answer 1', user, question1);
    await createAnswer('Admin answer 2', user, question2);

    if(db) db.close();
    console.log('done');
}

populate().catch((err) => {
    console.log(err);
    if(db) db.close()
    process.exit(0)
});



