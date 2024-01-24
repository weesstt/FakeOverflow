[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/9NDadFFr)
Add design docs in *images/*

## Instructions to setup and run project
First run npm install in the client and server directories to make sure all packages are available and installed.

Then run node server/init.js [adminUsername] [adminPassword]
- This will populate the database with an admin user and questions/answers/tags. The email of the associated
admin user will be [adminUsername]@fakeoverflow.com

Then run node server/server.js [sessionKey] to start the backend.

Then run npm start in the client directory to start react.
