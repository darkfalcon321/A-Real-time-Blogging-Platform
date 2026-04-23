import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';  //Component wrapped used here :)
import { SocketProvider } from './contexts/SocketContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import PostForm from './pages/PostForm';
import UserProfile from './pages/UserProfile';
import Subscriptions from './pages/Subscriptions';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <div className="App">
                        <Navigation />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/posts/:id" element={<PostDetail />} />
                            <Route path="/users/:id" element={<UserProfile />} />
                            <Route 
                                path="/posts/new" 
                                element={
                                    <ProtectedRoute>
                                        <PostForm />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/posts/:id/edit" 
                                element={
                                    <ProtectedRoute>
                                        <PostForm />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/subscriptions" 
                                element={
                                    <ProtectedRoute>
                                        <Subscriptions />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </div>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;