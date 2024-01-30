# TrackMe! - Personal Organized Hub 
Website Url:-https://trackm.netlify.app

Welcome to TrackMe! - Your Personal Organized Hub.

## Project Overview

TrackMe! is a comprehensive platform designed to simplify your daily routine by providing task management, note-taking, and real-time weather information, all in one convenient place. The project is built using React with TypeScript and Vite for the frontend and MongoDB, Express, and TypeScript for the backend.

## Features

- **Task Management:** Create, prioritize, and organize multiple to-do lists. Set due dates and stay on top of your tasks effortlessly.

- **Note-Taking:** Jot down thoughts, ideas, and reminders in the Notes section. Access and edit your digital notebook from anywhere.

- **Weather Information:** Stay informed with the latest weather conditions for your location. Plan your day accordingly and receive weather alerts to stay safe.


## For Coding Purpose
## How to Run
- **1:** Fork both the `TrackMe--frontend` and `TrackMe-backend` repositories to your system.
- **2:** Create .env variable in frontend and backend.
- **3:** In .env variable of frontend store <!--VITE_CLIENT_ID (google client id for authentication/signin with OAUTH google authentication), VITE_SERVER_URL(on which your server/backend code is running)-->.
- **4:** In .env variable of backend store <!--JWT_SECRET(Use openssl to generate a random string (base64-encoded) OR write a random string(eg:-HJGHJGHJMNMSBVMN)),(PASSWORD,USER)(your mongodb user details),CLIENT_URL(url on which your frontend is running))-->.

### Frontend

2. Open a terminal and navigate to the `TrackMe--frontend/client` directory:
   ```bash
   npm i     <!-- To install required packages and modules-->
   npm run dev    <!-- IT will be running on port 5173-->

### Backend

3. Open a terminal and navigate to the `TrackMe-backend/server` directory:
   ```bash
   npm i     <!-- To install required packages and modules-->
   npm start    <!-- It will be running on port 3000-->

