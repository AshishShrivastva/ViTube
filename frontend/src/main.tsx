import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import store from './store/store.ts';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

// Pages
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Home from './pages/Home.tsx'; // Import Home
import AddVideo from './pages/AddVideo.tsx'; // Import AddVideo
import VideoDetail from './pages/VideoDetail.tsx'; // Import VideoDetail
import ChannelProfile from './pages/ChannelProfile.tsx'; // Import ChannelProfile
import MyContent from './pages/MyContent.tsx'; // Import MyContent
import LikedVideos from './pages/LikedVideos.tsx'; // Import LikedVideos
import History from './pages/History.tsx'; // Import History
import Tweets from './pages/Tweets.tsx'; // Import Tweets
import Subscribers from './pages/Subscribers.tsx'; // Import Subscribers
import Playlists from './pages/Playlists.tsx'; // Import Playlists
import PlaylistDetail from './pages/PlaylistDetail.tsx';
import Settings from './pages/Settings.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/login",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/add-video",
            element: <AddVideo />
        },
        {
            path: "/video/:videoId",
            element: <VideoDetail />
        },
        {
            path: "/channel/:username",
            element: <ChannelProfile />
        },
        {
            path: "/my-content",
            element: <MyContent />
        },
        {
            path: "/liked-videos",
            element: <LikedVideos />
        },
        {
            path: "/history",
            element: <History />
        },
        {
            path: "/tweets",
            element: <Tweets />
        },
        {
            path: "/subscribers",
            element: <Subscribers />
        },
        {
            path: "/playlists",
            element: <Playlists />
        },
        {
            path: "/playlist/:playlistId",
            element: <PlaylistDetail />
        },
        {
            path: "/settings",
            element: <Settings />
        },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)