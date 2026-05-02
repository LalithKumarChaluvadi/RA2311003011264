# Notification and Vehicle Maintenance Scheduler

This project is a simple web-based application for managing user notifications and vehicle maintenance schedules. It provides a clean frontend interface along with backend API routes to create notifications, schedule maintenance tasks, and check the application status.

## About the Project

The goal of this project is to make it easier to keep track of important vehicle-related reminders. Users can add notification details and maintenance schedules through the web interface, and the backend handles the data through API endpoints.

## Features

- Simple frontend interface
- Create notification reminders
- Add vehicle maintenance schedules
- Deliver pending notifications
- Health check API to verify the server status
- Built using Node.js without a heavy framework

## Tech Stack

- Node.js
- JavaScript
- HTML
- CSS
- HTTP module

## How to Run the Project

First, clone the repository:

```bash
git clone <your-repository-link>

Go into the project folder:

cd RA2311003011264-main

Start the application:

npm start
After running the app, open this in your browser:

http://localhost:3000
If port 3000 is already busy, the app may automatically run on another port such as:

http://localhost:3001
API Endpoints
GET  /api/health
POST /api/notifications
POST /api/maintenance
POST /api/notifications/deliver
Frontend Link
Local frontend link:

http://localhost:3001
Note: This link works only on the local system where the project is running. To share it publicly, the project needs to be deployed using a platform like Render, Vercel, Netlify, or Railway.

Project Purpose
This project was created as a practical implementation of a notification and maintenance scheduling system. It demonstrates backend routing, form handling, API communication, and a basic user interface in a lightweight Node.js application.

Author
RA2311003011264
