import axios from "axios";

export default class Model {

    constructor(){
        this.serverURL = "http://localhost:8000/";
    }

    /**
     * Function that executes POST request to server to create a user.
     * @param {String} username 
     * @param {String} email 
     * @param {String} password 
     * @returns Promise with axios result;
     */
    createUser(username, email, password){
        return new Promise((resolve, reject) => {
            const userData = {
                username: username, 
                email: email,
                password: password,
                date: new Date()
            }

            axios.post(this.serverURL + "users/create", userData).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        })
    }

    /**
     * Function to authenticate user with the server.
     * @param {String} email 
     * @param {String} password 
     * @returns A promise that tells you if the user is able to be logged in.
     */
    loginUser(email, password){
        return new Promise((resolve, reject) => {
            const user = {
                email: email, 
                password: password 
            }

            axios.post(this.serverURL + "users/login", user, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function to logout and destroy session with server.
     * @returns A promise that tells you if the user is able to be logged out.
     */
    logoutUser(){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "users/logout", {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function that contacts the server to see if there is an express session.
     * @returns A promise with the results of the axios request.
     */
    isLoggedIn(){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "users/login", {
                withCredentials: true,
              }).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function that makes a post request to server to post question.
     * @param {String} title Question title
     * @param {String} text Question text
     * @param {Array<String>} tags Strings representing user tag inputs.
     * @param {String} summary String representing the user's question summary.
     * @returns Promise that resolves with result of posting question.
     */
    postQuestion(title, summary, text, tags){
        return new Promise((resolve, reject) => {
            const data = {
                title: title,
                summary: summary,
                text: text,
                tags: tags,
                date: new Date()
            }
            axios.post(this.serverURL + "questions/create", data, {
                withCredentials: true,
              }).then((result) => {
                resolve(result);
            }).catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    }

    /**
     * Function that makes a GET request to the server to get all questions in the database.
     */
    getAllQuestions(){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/getall").then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject("Server error");
            })
        });
    }

    /**
     * Function that makes a POST request to the server to post an answer.
     * @param {Object} answerObj Object representing the answer to be posted. Must have text and questionID fields.
     * @returns Promise that resolves to the server response.
    */
    postAnswer(text, questionID){
        return new Promise((resolve, reject) => {
            const answer = {
                text: text,
                questionID: questionID,
                ans_date_time: new Date()
            }
    
            axios.post(this.serverURL + "answers/create", answer, {
                withCredentials: true,
              }).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function that makes a GET request to the server to increase the number of views on a question. 
     * @param {*} questionID The id of the question in mongoDB.
     * @returns A promise that resovles to the result of the GET request. Whether the request succeeds
     * or fails, it will always resolve because this is not a super important operation to interrupt the 
     * user flow. 
     */
    incrementViews(questionID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/" + questionID + "/views").then((result) => {
                resolve("Success");
            }).catch(() => {
                resolve(); 
            })
        })
    }

    /**
     * Function that makes a GET request to the server to get an array of all tags names.
     * @returns A promise that resolves to an array of objects representing tags. Each object will
     * have a name and questions key to get the name of a tag and all questions with that tag
     */
    getAllTags(){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "tags/getall").then((result) => {
                resolve(result.data);
            }).catch((error) => {
                console.log(error);
                reject("Server error!");
            })
        })
    }

    /**
     * Function that makes a GET request to the server to get the user obj of the specific user.
     * @param {String} userEmail The user to get the reputation for.
     * @returns A promise that resolves to an object representing the users.
     */
    getUser(userEmail){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "users/get/" + userEmail).then((result) => {
                resolve(result.data)
            }).catch((error) => {
                reject("Server error")
            })
        })
    }

    /**
     * Function that returns an array of question objects from Mongo given an array of question IDs
     * @param {*} questionsArr 
     * @returns An array of questions objects
     */
    async getQuestions(questionsArr){
        const result = []
        for(let questionID of questionsArr){
            let questionObj = await axios.get(this.serverURL + "questions/" + questionID);
            result.push(questionObj.data);
        }
        
        return result;
    }

    /**
     * Function that makes a POST request to the server to update the specified question.
     * @param {Object} questionObj Object of new question information
     * @returns A promise that resolves to the result of updating mongo db
     */
    updateQuestion(questionObj){
        return new Promise((resolve, reject) => {
            axios.post(this.serverURL + "questions/update", questionObj, {
                withCredentials: true,
              }).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function that makes a GET request to the server to delete the specified question.
     * @param {ObjectId} questionID 
     * @returns A promise that resolves to the result of the GET request.
     */
    deleteQuestion(questionID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/delete/" + questionID, {
                withCredentials: true,
              }).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        }) 
    }

    /**
     * Function that makes a get request to server to delete the specified tag.
     * @param {ObjectId} tagID The tag to be delete
     * @returns A promise that resolves to the result of the GET request.
     */
    deleteTag(tagID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "tags/delete/" + tagID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * Function that makes a get request to the server to get question objs of answer ids
     * @param {ObjectId} ansIds An array of object ids of answers to get the question objects for
     * @returns An array of question objects
     */
    async getAnsweredQuestions(ansIds){
        let questions = [];
        for(const ansID of ansIds){
            let result = await axios.get(this.serverURL + "questions/answered/" + ansID, {withCredentials: true});
            if(questions.find((q) => {return q._id === result.data._id}) === undefined){
                questions.push(result.data);
            }
        }
        return questions;
    }

    updateAnswer(answerID, answerText){
        return new Promise((resolve, reject) => {
            axios.post(this.serverURL + "answers/update/" + answerID, {answerText: answerText}, {withCredentials: true}).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }   

    deleteAnswer(answerID, questionID){
        return new Promise((resolve, reject) => {
            axios.post(this.serverURL + "answers/delete/" + answerID, {questionID: questionID}, {withCredentials: true}).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    upvoteQuestion(questionID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/upvote/" + questionID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    downvoteQuestion(questionID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/downvote/" + questionID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    getAllUsers(){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "users/getall", {withCredentials: true}).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    deleteUser(userEmail){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "users/delete/" + userEmail, {withCredentials: true}).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    upvoteAnswer(answerID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "answers/upvote/" + answerID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    downvoteAnswer(answerID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "answers/downvote/" + answerID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    postComment(questionID, comment){
        return new Promise((resolve, reject) => {
            axios.post(this.serverURL + "questions/postcomment/" + questionID, {comment: comment, commentDate: new Date()}, {withCredentials: true}).then((result) => {
                resolve(result.data);
            }).catch((error) => {
                reject(error.response.data);
            })
        })
    }

    upvoteComment(commentID){
        return new Promise((resolve, reject) => {
            axios.get(this.serverURL + "questions/comments/upvote/" + commentID, {withCredentials: true}).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        })
    }
}