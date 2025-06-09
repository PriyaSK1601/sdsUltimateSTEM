# SDS-ULTIMATE_STEM
41113 Software Development Studio - Ultimate STEM Project 

Client: Chris Ferrie

Requirements: Creating a tournament-style website with Firebase Authentication and MongoDB database for users to vote on their preferred book ideas.

## Developers:
- Shiva Priya Kadarla 
- Anna Lazarevic
- Julia Pham 

## Testers:
- Michaela Sabio
- Raizelle Nana

## Business Analyst:
- Bao Minh Tam Phuong
- Tamara Haque (TL)


## Compiling Instructions 
1. Download and install Node.js from https://nodejs.org/en/download/. Make sure to enable the option to add it to your system PATH.
2. Download the project by either cloning the main branch using GitHub Desktop or downloading the ZIP file from GitHub and extracting it to your desired location.
3. Open the project folder in Visual Studio Code. Make sure the folder contains the package.json file.
4. Open the terminal in VS Code and navigate to the project directory if you’re not already in it.
5. Run the following commands one at a time to install dependencies:
   - npm install bootstrap@v5.3.3
   - npm install --save react-toastify
   - npm install firebase
   - npm install firebase-admin
   - npm install mongoose
   - npm install axios 
   - npm install react-router-dom 

6. Go to your MongoDB Atlas account and ensure that your current IP address is enabled under Network Access to allow application to connect to the MongoDB server.
7. Start the application by running:
   - npm start
8. Run the backend server in an additional terminal:
   - cd my-app
   - cd server
   - npm start
9. The program should automatically open in your browser at http://localhost:3000.
