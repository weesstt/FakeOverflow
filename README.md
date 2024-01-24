## Instructions to setup and run project
First run npm install in the client and server directories to make sure all packages are available and installed.

Then run node server/init.js [adminUsername] [adminPassword]
- This will populate the database with an admin user and questions/answers/tags. The email of the associated
admin user will be [adminUsername]@fakeoverflow.com

Then run node server/server.js [sessionKey] to start the backend.

Then run npm start in the client directory to start react.
