# Programming Contest Tracker (TLE Eliminators Assignment)

A comprehensive platform for tracking upcoming, ongoing, and past competitive programming contests across multiple platforms like Codeforces, CodeChef, and LeetCode.

  [![Live Demo](https://img.shields.io/badge/LIVE_DEMO_→-4F46E5?style=for-the-badge&labelColor=000000&logo=vercel&logoColor=white)](https://tle-assingment.vercel.app/)

  [![Backend](https://img.shields.io/badge/Render-Backend-4F46E5?style=for-the-badge&labelColor=000000&logo=render&logoColor=white)](https://tle-assingment.onrender.com/)

  [![Video Demo](https://img.shields.io/badge/VIDEO_DEMO-Watch_Now_→-FF0000?style=for-the-badge&labelColor=000000&logo=youtube&logoColor=white)](https://youtu.be/yZXkfRDlyfs?si=YZxV_MDPo6l9mRDn)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#key-features)
4. [Technical Implementation](#technical-implementation)
5. [API Docs](#backend-apis)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Contest Endpoints](#contest-endpoints)
   - [Solution Endpoints](#solutions-endpoints)
6. [State Management](#state-management)
7. [Data Flow](#data-flow)
8. [Usage Instructions](#usage-instructions)
## Project Overview

This project is designed to help competitive programmers stay updated with coding contests across different platforms. The application provides a centralized interface to view contest details, add them to a calendar, receive notifications, bookmark favorite contests, and access solutions for past contests.

## Key Features

### User Authentication
  Register User,Login User,Logout User.
### Contest Tracking
- **Multi-platform Integration**: Fetches contest data from Codeforces, CodeChef, and LeetCode.
- **Real-time Updates**: Displays upcoming, ongoing, and past contests with accurate timing information.
- **Time Countdown**: Shows the remaining time before upcoming contests start.
- **Duration Information**: Provides contest duration in a user-friendly format.

### User Experience
- **Contest Notifications**:Toggle notification for contests to get notified before they start.(`Bonus`)
- **Calendar Events**: Track coding events using a real-time calendar.(`Bonus`)
- **Google Calendar**: Add Coding Events to Google Calendar.(`Bonus`)

- **Platform Filtering**: Filter contests by platform (Codeforces, CodeChef, LeetCode).
- **Time Filtering**: Filter contests by their status (past, live, upcoming).
- **Contest Bookmarking**: Save contests to a personal bookmarks list for quick access.(`Bonus`)
- **Search Functionality**: Search for specific contests across all platforms.
- **Responsive Design**: Fully optimized for mobile and tablet use.
- **Theme Support**: Toggle between light and dark modes for comfortable viewing.(`Bonus`)

### Contest Solutions
- **YouTube API Integration**: Fetches solution videos from TLE Eliminator’s playlists.
- **Solution Links**: Access YouTube solution links for past contests.
- **Solutions Filtering**: Filter solutions by platform (Codeforces, CodeChef, LeetCode).
- **Solutions Mapping**: Matches video titles with contest titles using both numerical and keyword-based matching for high accuracy.
- **Auto-Fetch Solutions**: Automatically links YouTube solution videos to corresponding contests.

## Technical Implementation

### Tech Stack - MERN

#### Frontend
- **React**: Component-based UI development with TypeScript.
- **Vite**: Fast build tooling for modern web applications.
- **React Router**: Enables smooth navigation between different views.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: Component library for a consistent UI design.
- **Framer Motion**: Enhances user experience with animations.
- **Context API**: Manages global state effectively.
- **Tanstack Query**: Handles data fetching and state management efficiently.

#### Backend
- **Express.js**: Server-side framework for handling API requests.
- **MongoDB**: Database for storing user data and bookmarks.
- **Authentication & APIs**: Handles user authentication, contest data fetching, and solution linking.

## Architecture

This project follows the **MVC (Model-View-Controller)** architecture pattern:

- **Model**: MongoDB schemas define the data structure for contests and users
- **View**: React components render the UI and handle user interactions (Client-side)
- **Controller**: Express route handlers process requests and manage business logic

## Backend APIs
### API Integration
- **CLIST API**: Fetches contest data from multiple platforms.
- **YouTube Data API**: Fetches solution videos automatically.
- **Local Storage**: Stores user notification preferences and settings.

### Authentication Endpoints



#### `POST /api/auth/signup`
Creates a new user account.

**Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "examplepass"
}
```

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.


### Contest Endpoints
#### `GET /api/contests/getContests`
Retrieves contests from clist's api in a filtered format and sorted base on latest first.

**Query Params:**
- `host`: Platform for which you want the contests.(Default:`all`,Accepted values:`Leetcode`,`Codechef`,`Codeforces`) for multi platforms add them separated by commas(`Ex-leetcode,codechef`)

- `query`: For query based filtering
- `page`: Default(1)
- `limit`: Default(10)
- `type`: Default(`upcoming`), Accepted values(`upcoming,live,past`)

**Response:**
```json

  {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "contests": [
        {
            "duration": 7200,
            "end": "2025-03-22T16:35:00",
            "event": "Codeforces Round (Div. 2)",
            "host": "codeforces.com",
            "href": "https://codeforces.com/contests/2085",
            "id": 58279175,
            "n_problems": null,
            "n_statistics": null,
            "parsed_at": null,
            "problems": null,
            "resource": "codeforces.com",
            "resource_id": 1,
            "start": "2025-03-22T14:35:00",
            "contestType": "upcoming"
        },
  ]
}
```

### Solutions Endpoints
#### `POST /api/contests/solutions`
Retrieves contests from yt's api based on query params provided.
**Query Params:**
- `host`: Platform for which you want the contests.(Default:`all`,Accepted values:`Leetcode`,`Codechef`,`Codeforces`) for multi platforms add them separated by commas(`Ex-leetcode,codechef`)

- `query`: Search query to match with title
- `page`: Default(1)
- `limit`: Default(10)
**Response:**
```json

{
    "totalVideos": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "videos": [
        {
            "id": "UExjWHBrSTlBLVJaTFVmQlNOcC1ZUUJDT2V6WktiRFNnQi4zOTVGMDIwNzkzODk2QTQ1",
            "title": "Example Title",
            "description": "Example Description",
            "thumbnail": "https://i.ytimg.com/vi/1M6DG6XjVaY/default.jpg",
            "url": "https://www.youtube.com/watch?v=1M6DG6XjVaY",
            "uploadedAt": "2025-03-17T19:29:47Z"
        },
    ]
}
```
#### `GET /api/user/bookmarks`
Retrieves user's bookmarked contests.
**Query Params:**
- `userId`: User's Id.

#### `POST /api/user/bookmarks`
Add bookmark for a contest.

**Body:**
```json
{
  "userId": "user_id",
  "contestId": "contest_id"
}
```

#### `DELETE /api/user/bookmarks`
Remove bookmark for a contest.

**Body:**
```json
{
  "userId": "user_id",
  "contestId": "contest_id"
}
```

## State Management
- **React Hooks**: Utilizes `useState`, `useEffect` for component-level state management.
- **Custom Hooks**: Encapsulates reusable logic.
- **Context API**: Provides global state management.

## Data Flow
1. Contest data is fetched from multiple APIs.
2. Solution data is retrieved from predefined YouTube playlists.
3. Data is normalized into a common format.
4. Users can filter, search, and interact with contest listings.
5. Bookmarking contests requires user authentication.
6. Solution links are automatically fetched and mapped to respective contests.

## YouTube Solution Integration

### Automatic Solution Linking
The platform integrates with YouTube to provide solution videos for past contests.

### Pre-configured YouTube Playlists
- **Codeforces**: `PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB`
- **LeetCode**: `PLcXpkI9A-RZI6FhydNz3JBt-pi25Cbr`
- **CodeChef**: `PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr`

## Usage Instructions

### For Users

#### Viewing Contests
- Visit the main page to see all contests.
- Use the platform filter buttons to select specific platforms.
- Switch tabs to view upcoming, ongoing, or past contests.
- Use the search bar to find specific contests.

#### Bookmarking Contests
- Click the bookmark icon on any contest card to save it.
- Visit the Bookmarks page to view all saved contests.
- Remove bookmarks by clicking the bookmark icon again.

#### Notifications for Contests
- Click the bell icon on any contest card to enable notifications.
- A popup will ask to enable browser notifications.
- Select the preferred notification time (e.g., 10 mins, 15 mins before the contest).
- Toggle the bell icon to enable or disable notifications.

#### Accessing Solutions
- If solutions are available, a "View Solution" button will be displayed.
- Click the button to open the YouTube solution video.
- Use the solutions tab to search for specific contests.

#### Theme Switching
- Use the theme toggle in the navigation bar to switch between light and dark modes.

## Development Setup

To set up the project locally, follow these steps:

### Prerequisites
- **Node.js** installed on your system.
- **YouTube API Key** and **CLIST API Key** for fetching contest and solution data.

### Setting Up the Client (Frontend)
```sh
# Step 1: Clone the repository
git clone https://github.com/rishabhpathak359/TLE_ASSINGMENT

# Step 2: Navigate to the client directory
cd TLE_ASSIGNMENT/client

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Setting Up the Server (Backend)
```sh
# Step 1: Navigate to the server directory
cd TLE_ASSIGNMENT/client

# Step 2: Install the necessary dependencies
npm install

# Step 3: Create an `.env` file and add the required API keys and MongoDB configuration
YT_API_KEY=your_youtube_api_key
CLIST_API_KEY=your_clist_api_key
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
# Step 4: Start the backend server
node index.js
```

After following these steps, the client should be running on `http://localhost:5173/` (or a similar port), and the server should be running on `http://localhost:5000/` (or as configured in your environment).

