# Node.js Pastebin Application

This is a Node.js application for managing pastes with unique IDs and generating custom pages for each paste. It includes features such as login and registration systems.

![image](https://github.com/silvermete0r/pastebin_app_nodejs/assets/108217670/1fc933e6-5cda-4455-af74-06b613da41c9)


## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Features

- **User Authentication:** Includes login and registration systems for users.
- **Github Username Verification:** Only github-verified users can be registred in the system.
- **Create Pastes:** Users can create new pastes with unique IDs.
- **Custom Pages:** Generates custom pages for each paste, allowing users to view paste details.
- **Auto-Deletion:** Automatically deletes expired pastes on an hourly basis.
- **REST API Endpoints:** Provides RESTful API endpoints for managing pastes, including creation, retrieval, update, and deletion.

## Technologies Used

- **Node.js:** JavaScript runtime environment for server-side development.
- **Express.js:** Web application framework for Node.js used for routing and middleware.
- **MongoDB:** NoSQL database used for storing paste and user data.
- **Mongoose:** MongoDB object modeling tool for Node.js used for data modeling and querying.
- **bcrypt:** Library for hashing passwords securely.
- **Express Session:** Middleware for managing user sessions in Express.js.
- **Shortid:** Library for generating unique IDs for pastes.
- **Cron:** Library for scheduling tasks, used for auto-deletion of expired pastes.

## Setup

To set up and run the application locally, follow these steps:

1. **Clone the Repository:** `git clone <repository-url>`
2. **Install Dependencies:** `npm install`
3. **Set Environment Variables:** Create a `.env` file in the root directory and add the following variables: `PORT=3000`, `MONGO_URI=<your-mongodb-uri>`

4. **Start the Server:** `npm start`

## Usage

Once the application is set up and running, you can access it via the specified port (default is 3000). Here are some key endpoints and routes:

- **Login Page:** Access the login page at `/login_page`.
- **Registration Page:** Access the registration page at `/register_page`.
- **Pastes Page:** Access the pastes page at `/pastes`.
- **API Endpoints:** Use the provided REST API endpoints for managing pastes and user authentication.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
