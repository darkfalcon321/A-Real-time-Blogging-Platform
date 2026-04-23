import { Navbar, Nav, Container, Dropdown, Badge, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Bell } from 'react-bootstrap-icons';

const Navigation = () => {
    const { user, login, logout, loading } = useAuth();
    const { notifications, unseenCount, markNotificationsAsSeen } = useSocket();

    const handleNotificationClick = () => {
        markNotificationsAsSeen();
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    // Helper function to get the correct post ID
    const getPostId = (notification) => {
        if (typeof notification.postId === 'string') {
            return notification.postId;
        }
        if (notification.postId && notification.postId._id) {
            return notification.postId._id;
        }
        return '';
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
            <Container>
                <Navbar.Brand as={Link} to="/">Blog</Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Posts</Nav.Link>
                        {user && (
                            <>
                                <Nav.Link as={Link} to="/posts/new">New Post</Nav.Link>
                                <Nav.Link as={Link} to="/subscriptions">Subscriptions</Nav.Link>
                            </>
                        )}
                    </Nav>
                    




                    <Nav>
                        {loading ? (                                            // if still verifying
                            <Nav.Link disabled>Loading...</Nav.Link>

                        ) : user ? (                                           // else-if user exists
                            <>
                                {/* Notification Bell */}                                
                                <Dropdown align="end" onToggle={(isOpen) => {
                                    if (isOpen) {
                                        handleNotificationClick();
                                    }
                                }}>
                                    <Dropdown.Toggle 
                                        variant="outline-light" 
                                        id="notification-dropdown"
                                    >
                                        <Bell />
                                        {unseenCount > 0 && (
                                            <Badge bg="danger" className="ms-1">
                                                {unseenCount}
                                            </Badge>
                                        )}
                                    </Dropdown.Toggle>
                                    
                                    <Dropdown.Menu style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <Dropdown.Header>Notifications</Dropdown.Header>
                                        {notifications.length === 0 ? (
                                            <Dropdown.Item disabled>
                                                📭 You have no notifications
                                            </Dropdown.Item>
                                        ) : (
                                            notifications.slice(0, 10).map((notification, index) => (
                                                <Dropdown.Item 
                                                    key={index}
                                                    as={Link}
                                                    to={`/posts/${getPostId(notification)}`}
                                                >
                                                    <div>
                                                        <strong>{notification.title || notification.postId?.title}</strong>
                                                    </div>
                                                    <small className="text-muted">
                                                        By {notification.authorName || notification.postId?.createdBy?.displayName || notification.postId?.createdBy?.username}
                                                    </small>
                                                    <br />
                                                    <small className="text-muted">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </small>
                                                </Dropdown.Item>
                                            ))
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                                
                                {/* User Profile */}
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                                        {user.profilePicture && (
                                            <Image 
                                                src={user.profilePicture || "/placeholder.svg"} 
                                                roundedCircle 
                                                width="25" 
                                                height="25" 
                                                className="me-2"
                                            />
                                        )}
                                        {user.displayName || user.username}
                                    </Dropdown.Toggle>
                                    
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to={`/users/${user._id}`}>
                                            My Profile
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (               // else LOGIN!!
                            <>
                                <Nav.Link as={Link} to="/login" style={{ cursor: 'pointer' }}>
                                    Login
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;