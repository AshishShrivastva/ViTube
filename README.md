# ViTube 📹

**ViTube** is a robust, full-stack video hosting platform built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It serves as a comprehensive "YouTube Clone" designed to demonstrate production-grade web development practices, focusing on scalability, data aggregation, and a clean user experience.

This isn't just a simple video player; it's a complete ecosystem handling real-world scenarios like video uploads, complex subscription systems, tweet-style community posts, and a specialized dashboard for creators.

---

## 🚀 Key Features

### 🔐 **Authentication & Security**
- **Secure Access:** JWT-based authentication system using Access and Refresh tokens to keep sessions secure without frequent logins.
- **Data Protection:** Passwords are encrypted using bcrypt, and sensitive routes are protected to ensure only authorized users can manage content.
- **Profile Customization:** Users can fully manage their identity, including updating avatars, cover images, and account details.

### 📺 **Video Management**
- **Seamless Uploads:** Integrated with **Cloudinary** for reliable storage of video files and thumbnails.
- **Playback Experience:** A custom video player interface designed for smooth viewing.
- **Content Control:** Creators have full control over their content, with options to publish or unpublish videos instantly via the dashboard.

### 🎨 **Interactive UI/UX**
- **Responsive Design:** A fully fluid layout built with **Tailwind CSS**, ensuring the app looks and works great on both desktops and mobile devices.
- **Optimized Performance:** utilizes **Redux Toolkit** for efficient state management, ensuring the interface feels snappy even when handling complex data like comments and playlists.
- **Visual Feedback:** Loading skeletons and spinners provide a polished user experience during data fetching.

### 🤝 **Social Interactions**
- **Engagement:** Users can like videos, post comments, and reply to others, fostering a sense of community.
- **Community Tab:** A dedicated "Tweets" section where creators can post text updates to interact with their audience without uploading video.
- **Subscription Feed:** A personalized view showing only content from channels the user follows.
- **Smart Playlists:** Users can organize content into custom playlists for easy binge-watching.

### 📊 **Creator Dashboard**
- **Channel Analytics:** A centralized hub to view total channel views, subscriber counts, and video metrics.
- **Content Studio:** A powerful table view allowing creators to edit video details, delete content, or toggle visibility status in bulk.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React (Vite) with TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Routing:** React Router DOM

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose for modeling)
- **Data Logic:** Complex MongoDB aggregation pipelines for efficient data joins and filtering.

### **Tools & Services**
- **Cloud Storage:** Cloudinary (for Media Assets)
- **Version Control:** Git & GitHub
- **API Testing:** Postman

---

## 🔮 Future Roadmap
While the core infrastructure is solid, there are always areas to grow. Here is what is planned for V2:

- **Video Transcoding:** Implementing FFmpeg to support multiple video qualities (360p, 720p, 1080p).
- **Live Streaming:** Adding RTMP server integration for real-time broadcasts.
- **AI Recommendations:** A suggestion engine to recommend videos based on watch history.
- **Social Login:** Adding Google/GitHub OAuth for one-click sign-ups.

---

## ⚙️ Getting Started

If you want to run this project locally to test or contribute, follow these steps.

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (Local or Atlas)
- **Cloudinary Account** (for media storage)

### 1. Clone the Repository
git clone [https://github.com/ashish-shrivastva/ViTube.git](https://github.com/ashish-shrivastva/ViTube.git)

```bash
cd ViTube
```

### 2. Backend Setup
Install dependencies:

```bash
npm install

# Create a .env file in the root directory and add the **following**:

PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend Setup
Navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:

```bash
npm install
# Create a .env file in the frontend directory:
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Run the Project
You will need to run the backend and frontend simultaneously (in two separate terminals).

**Terminal 1 (Backend):**

From root directory

```bash
npm run dev
```

**Terminal 2 (Frontend):**

From frontend directory
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 to view it in the browser.

## 👤 Author
### Ashish Kumar Shrivastva
A passionate Full Stack Developer focused on building scalable web applications.

## 🎓 Acknowledgements
I would like to express my sincere gratitude to **Hitesh Choudhary Sir** for his exceptional guidance and mentorship. His teachings on backend architecture and best practices provided the conceptual foundation for this project.

## 🛡️ Note
 >All code implementation, logic development, feature enhancements, and debugging in this project have been independently executed by me.
 > If you find this project helpful, feel free to ⭐ star the repository!