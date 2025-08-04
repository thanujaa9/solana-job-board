# Job & Networking Portal

## Overview
This is a decentralized job board application built on the MERN stack with Solana blockchain integration for secure and transparent transactions. It allows users to post job listings and for job seekers to apply, with a platform fee handled via Solana's devnet.

## Features
- **User Authentication:** Secure user registration and login.
- **Job Posting:** Employers can post new job listings with details like title, description, skills, and compensation.
- **Solana Integration:** A platform fee is required to post a job, processed securely on the Solana blockchain using a Phantom wallet.
- **Job Feed:** A public-facing page where anyone can view available job listings.
- **User Dashboard:** Authenticated users have a private dashboard to manage their posted jobs and view applicants.
- **Application Management:** Employers can view a list of applicants for each job they've posted.
- **Responsive UI:** The application is built with Tailwind CSS for a modern, mobile-friendly design.

## Technologies Used

**Frontend**
- **React:** A JavaScript library for building user interfaces.
- **React Router:** For handling client-side routing.
- **Axios:** For making HTTP requests to the backend.
- **Solana/Web3.js:** To interact with the Solana blockchain.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Phantom Wallet Adapter:** To connect to the user's Phantom wallet.

**Backend**
- **Node.js & Express:** The server-side runtime and web framework.
- **MongoDB:** A NoSQL database to store job and user data.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB.
- **JSON Web Tokens (JWT):** For secure user authentication.
- **Express-validator:** For server-side validation.

## Prerequisites
To run this project locally, you will need:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally or a cloud instance like MongoDB Atlas)
- A Phantom Wallet browser extension with funds on the Solana Devnet.

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd RIZE_JOB_PORTAL 3
    ```

2.  **Backend Setup**
    - Navigate to the backend directory:
      ```bash
      cd backend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - **Create a `.env` file** in the `backend` directory. This file stores your sensitive environment variables and should **not** be committed to version control.
    - Add the following content to your `.env` file, replacing the placeholder values with your actual secrets:
      ```env
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=a_very_long_and_random_string
      ```
    - Start the backend server:
      ```bash
      npm run server
      ```
    - The backend should now be running on `http://localhost:8000`.

3.  **Frontend Setup**
    - Open a new terminal and navigate to the frontend directory:
      ```bash
      cd frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Start the frontend application:
      ```bash
      npm run dev
      ```
    - The frontend should now be running on `http://localhost:5173`.


