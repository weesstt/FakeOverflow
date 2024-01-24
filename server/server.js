const express = require("express");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

var sessions = require("express-session");
const secret = process.argv[2];

const app = express();
const mongoDB = "mongodb://127.0.0.1:27017/fake_so"
var db;
const cors = require("cors");

const QuestionModel = require("./models/questions.js");
const AnswerModel = require("./models/questions.js");
const TagModel = require("./models/tags.js");
const UserModel = require("./models/users.js");

const {createUser, loginUser, getUserObj, removeQuestionFromUser, getAllUsers, deleteUser} = require("./controllers/UserController.js");
const {postQuestion, getAllQuestions, incrementViewCount, getQuestionById, updateQuestion, removeTagFromQuestions, getQuestionByAnswerID, upvoteQuestion, downvoteQuestion} = require("./controllers/QuestionController.js");
const {postAnswer, removeAnswersFromUsers, getAnswerById, updateAnswer, deleteAnswer, upvoteAnswer, downvoteAnswer} = require("./controllers/AnswerController.js");
const {getAllTags} = require("./controllers/TagController.js");
const {postComment, upvoteComment, removeQuestionCommentsFromUsers} = require("./controllers/CommentController.js");

const server = app.listen(8000, () => {
    if(process.argv.length !== 3){
        server.close(() => {
            console.log("Incorrect number of arguments!");
            console.log("Correct Usage: node server.js <SessionSecretKey>");
            process.exit(0);
        })
    }

    mongoose.connect(mongoDB, {});//{useNewUrlParser: true, useUnifiedTopology: true} deprecated?
    db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error"));
})

process.on("SIGINT", () => {
    server.close(() => {
        db.close()
        console.log("Server closed. Database instance disconnected.");
        process.exit(0)
    })
})

app.use(cors({
    origin: "http://localhost:3000",
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
  }));

//Middleware to parse requests
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Session Middleware
app.use(
    sessions({
      secret: secret,
      resave: false,
      saveUninitialized: false,
      name: "session",
      cookie: {},
      store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fake_so'})
    })
  );

//Rotues
/**
 * Route to create user, username, password, and email needed in request or bad request.
 */
app.post("/users/create", (req, res) => {
    if(req.body.username === undefined || req.body.email === undefined || req.body.password === undefined || req.body.date === undefined){
        res.status(400).send("Username, email, password, or date is missing from request body!");
    }else{
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email; 
        let date = req.body.date;

        createUser(username, email, password, date).then((result) => {
            res.send(result);
        }).catch((error) => {
            res.status(400).send(error);
        });
    }
})

/**
 * Route to login user. Email and password needed in request or bad request.
 */
app.post("/users/login", (req, res) => {
    if(req.body.email === undefined || req.body.password === undefined){
        res.status(400).send("Email or password is missing from request body!");
    }else{
        let email = req.body.email;
        let password = req.body.password;
        loginUser(email, password).then((user) => {
            req.session.user = user;
            res.send(user);
        }).catch((error) => {
            res.status(400).send(error);
        });
    }
});

/**
 * Route to check if there is a session for the user.
 */
app.get("/users/login", (req, res) => {
    if(req.session.user){
        res.send(req.session.user);
    }else{
        res.status(401).send("User not authenticated");
    }
})

/**
 * Route to log out user and destroy session.
 */
app.get("/users/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.status(400).send(err);
        }else{
            res.send("Success");
        }
    });
})

/**
 * Route to post a question if the user is logged in.
 */
app.post("/questions/create", (req, res) => {
    if(req.session.user){
        const user = req.session.user;
        const questionObj = req.body;
        questionObj.user = user;

        if(questionObj.title === undefined || questionObj.text === undefined || questionObj.tags === undefined){
            res.status(400).send("Question title, text, or tags are missing from post request body!");
        }else if(!(questionObj.tags instanceof Array)){
            res.status(400).send("Question tags must be of type array of strings");
        }
        postQuestion(questionObj).then((result) => {
            res.send(result);
        }).catch((error) => {
            res.status(400).send(error);
        })
    }else{
        res.status(401).send("Only authorized users can post new questions!");
    }
})

/**
 * Route to retrieve all questions from MongoDB.
 */
app.get("/questions/getall/", (req, res) => {
    getAllQuestions().then((result) => {
        res.send(result);
    }).catch((error) => {
        console.log(error);
        res.status(400).send(error);
    });
})  

/**
 * Route to post an answer to a question if the user is logged in.
 */
app.post("/answers/create", (req, res) => {
    if(req.session.user){
        const user = req.session.user;
        const answerObj = req.body;
        answerObj.user = user;
        if(answerObj.text === undefined || answerObj.questionID === undefined){
            res.status(400).send("Answer text or questionID is missing from post request body!");
            return;
        }
    
        postAnswer(answerObj).then((result) => {
            res.send(result);
        }).catch((error) => {
            res.status(400).send(error);
        })
    }else{
        res.status(401).send("Only authorized users can post new answers!");
    }
})

/**
 * Route to increase a questions view count.
 */
app.get("/questions/:id/views", (req, res) => {
    let questionID = req.params["id"];
    incrementViewCount(questionID).then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
})

/**
 * Route to get all tag names from database.
 */
app.get("/tags/getall", (req, res) => {
    getAllTags().then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
})

/**
 * Route to get an object representing a user from the database.
 */
app.get("/users/get/:userEmail", (req, res) => {
    getUserObj(req.params["userEmail"]).then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
})

/**
 * Route to get a question by specifiying an id
 */
app.get("/questions/:id", (req, res) => {
    getQuestionById(req.params["id"]).then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
})


/**
 * Route to post a question if the user is logged in.
 */
app.post("/questions/update", (req, res) => {
    if(req.session.user){
        const user = req.session.user;
        const questionObj = req.body;
        if(questionObj.user.email !== user.email && user.admin !== true){
            res.status(400).send("Only authors of questions can update them!");
            return;
        }

        questionObj.user = user;

        if(questionObj.title === undefined || questionObj.text === undefined || questionObj.tags === undefined){
            res.status(400).send("Question title, text, or tags are missing from post request body!");
            return;
        }else if(!(questionObj.tags instanceof Array)){
            res.status(400).send("Question tags must be of type array of strings");
            return;
        }
    
        updateQuestion(questionObj).then((result) => {
            res.send(result);
        }).catch((error) => {
            res.status(400).send(error);
        })
    }else{
        res.status(401).send("Only authorized users can update questions!");
    }
})


/**
 * Route to delete a question if the user is logged in and the user is the author of such question.
 */
app.get("/questions/delete/:id", (req, res) => {
    if(req.session.user){
        QuestionModel.findById(req.params["id"]).then((questionObj) => {
            const user = req.session.user;
            if(questionObj.user.email !== user.email && user.admin !== true){
                res.status(400).send("Only authors of questions can delete them!");
                return;
            }

            const questionID = questionObj._id;
    
            removeQuestionFromUser(questionID, questionObj.user).then(() => {
                removeAnswersFromUsers(questionObj).then(() => {
                    removeQuestionCommentsFromUsers(questionObj).then(() => {
                        QuestionModel.findByIdAndDelete(questionID).then(() => {
                            res.send("Success");
                        }).catch((error) => {
                            console.log(error);
                            res.status(400).send(error);
                        })
                    }).catch((error) => {
                        console.log(error);
                        res.status(400).send(error);
                    })
                }).catch((error) => {
                    console.log(error);
                    res.status(400).send(error);
                })
            }).catch((error) => {
                console.log(error);
                res.status(400).send(error);
            })
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error);
        })
    }else{
        res.status(401).send("Only authorized users can delete questions!");
    }
})

/**
 * Route to delete a question if the user is logged in and the user is the author of such question.
 */
app.get("/tags/delete/:id", (req, res) => {
    if(req.session.user){
        const tagID = req.params["id"].trim();
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.tags.includes(tagID)){
                QuestionModel.find().then((questions) => {
                    //make sure that only questions by this user are using this tag
                    const ids = [];
                    for(const question of questions){
                        if(question.tags.includes(tagID)){
                            ids.push(question._id);
                        }
                    }

                    for(const checkID of ids){
                        if(!user.questions.includes(checkID)){
                            res.status(400).send("Only tags that are not being used by anyone else can be edited or deleted!");
                            return;
                        }
                    }
                    
                    UserModel.findOneAndUpdate({email: user.email}, {$pull: {tags: tagID}}).then(() => {
                        console.log("delete tag from user " + tagID);
                        removeTagFromQuestions(tagID, ids).then(() => {
                            TagModel.findByIdAndDelete(tagID).then((result) => {
                                res.send("Success");
                            }).catch((error) => {
                                console.log(error);
                                res.status(400).send(error);
                            });
                        }).catch((error) => {
                            res.status(400).send(error);
                        })
                    }).catch((error) => {
                        res.status(400).send(error);
                    })
                }).catch((error) => {
                    console.log(error);
                    res.status(400).send(error);
                })
            }else{
                res.status(400).send("Only users who have created a tag can delete/edit such tag!");
            }
        })
    }else{
        res.status(401).send("Only authorized users can delete tags!");
    }
})

/**
 * Route to increase a questions view count.
 */
app.get("/questions/answered/:id", (req, res) => {
    let answerID = req.params["id"];
    getQuestionByAnswerID(answerID).then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send(error);
    })
})

app.post("/answers/update/:id", (req, res) => {
    if(req.session.user){
        if(req.body.answerText === undefined){
            res.status(400).send("Request body missing answer text.");
            return;
        }
        const answerID = req.params["id"];
        const user = req.session.user;
        getAnswerById(answerID).then((answer) => {
            if(answer.user.email === user.email || user.admin === true){
                updateAnswer(answerID, req.body.answerText).then((result) => {
                    res.send(result);
                });
            }else{
                res.status(401).send("Only authors of answers can update them!");
            }
        })
    }else{
        res.status(401).send("Only authorized users can update answers!");
    }
})

app.post("/answers/delete/:id", (req, res) => {
    if(req.session.user){
        if(req.body.questionID === undefined){
            res.status(400).send("Request body missing answer text.");
            return;
        }
        const answerID = req.params["id"];
        const questionID = req.body.questionID;
        const user = req.session.user;
        getAnswerById(answerID).then((answer) => {
            if(answer.user.email === user.email || user.admin === true){
                deleteAnswer(answerID, questionID, answer.user.email).then(() => {
                    res.send("Success");
                }).catch((error) => {
                    res.status(400).send(error);
                });
            }else{
                res.status(401).send("Only authors of answers can delete them!");
            }
        })
    }else{
        res.status(401).send("Only authorized users can delete answers!");
    }
})

app.get("/questions/upvote/:id", (req, res) => {
    if(req.session.user){
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.reputation < 50 && user.admin === false){
                res.status(400).send("Insufficient reputation");
            }else{
                const questionID = req.params["id"];
                upvoteQuestion(questionID).then(() => {
                    res.send("Success");
                }).catch((error) => {
                    res.status(400).send(error);
                })
            }
        })
    }else{
        res.status(401).send("Only authorized users can vote on questions")
    }
})

app.get("/questions/downvote/:id", (req, res) => {
    if(req.session.user){
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.reputation < 50 && user.admin === false){
                res.status(400).send("Insufficient reputation");
            }else{
                const questionID = req.params["id"];
                downvoteQuestion(questionID).then(() => {
                    res.send("Success");
                }).catch((error) => {
                    res.status(400).send(error);
                })
            }
        });
    }else{
        res.status(401).send("Only authorized users can vote on questions")
    }
})

app.get("/users/getall", (req, res) => {
    if(req.session.user){
        if(req.session.user.admin === true){
            getAllUsers().then((result) => {
                res.send(result);
            }).catch((error) => {
                res.status(400).send(error);
            })
        }else{
            res.status(401).send("Only admin users can retrieve all users");
        }
    }else{
        res.status(401).send("Only authorized users can retrieve all users");
    }
})

app.get("/users/delete/:userEmail", (req, res) => {
    if(req.session.user){
        if(req.session.user.admin === true){
            deleteUser(req.params["userEmail"]).then((result) => {
                res.send(result);
            }).catch((error) => {
                console.log(error);
                res.status(400).send(error);
            })
        }else{
            console.log(req.session.user);
            res.status(401).send("Only admin users can delete users");
        }
    }else{  
        res.status(401).send("Only authorized users can delete users");
    }
})


app.get("/answers/upvote/:id", (req, res) => {
    if(req.session.user){
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.reputation < 50 && user.admin === false){
                res.status(400).send("Insufficient reputation");
            }else{
                const answerID = req.params["id"];
                upvoteAnswer(answerID).then(() => {
                    res.send("Success");
                }).catch((error) => {
                    res.status(400).send(error);
                })
            }
        });
    }else{
        res.status(401).send("Only authorized users can vote on answers")
    }
})

app.get("/answers/downvote/:id", (req, res) => {
    if(req.session.user){
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.reputation < 50 && user.admin === false){
                res.status(400).send("Insufficient reputation");
            }else{
                const answerID = req.params["id"];
                downvoteAnswer(answerID).then(() => {
                    res.send("Success");
                }).catch((error) => {
                    res.status(400).send(error);
                })
            }
        });
    }else{
        res.status(401).send("Only authorized users can vote on answers")
    }
})

app.post("/questions/postcomment/:id", (req, res) => {
    if(req.session.user){
        UserModel.findOne({email: req.session.user.email}).then((user) => {
            if(user.reputation < 50 && user.admin === false){
                res.status(400).send("Insufficient reputation");
            }else{
                const questionID = req.params["id"];
                postComment(questionID, req.body.comment, req.session.user, req.body.commentDate).then((result) => {
                    res.send(result);
                }).catch((error) => {
                    console.log(error);
                    res.status(400).send(error);
                })
            }
        })
    }else{
        res.status(401).send("Only authorized users can comment")
    }
})


app.get("/questions/comments/upvote/:id", (req, res) => {
    if(req.session.user){
        const commentID = req.params["id"];
        upvoteComment(commentID).then(() => {
            res.send("Success");
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error);
        })
    }else{
        res.status(401).send("Only authorized users can upvote comments");
    }
})

