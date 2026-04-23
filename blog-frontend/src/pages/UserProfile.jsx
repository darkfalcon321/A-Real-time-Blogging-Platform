import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const isOwnProfile = user && user._id === id;

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
        if (user && !isOwnProfile) {
            checkSubscriptionStatus();
        }
    }, [id, user]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const userData = await response.json();
                setProfileUser(userData);
            } else {
                setError('User not found');
            }
        } catch (error) {
            setError('Error loading user profile');
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await fetch(`/api/users/${id}/posts`, {
                credentials: 'include'
            });
            if (response.ok) {
                const postsData = await response.json();
                setPosts(postsData);
            }
        } catch (error) {
            console.error('Error loading user posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkSubscriptionStatus = async () => {
        try {
            const response = await fetch(`/api/subscriptions/check/${id}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setIsSubscribed(data.isSubscribed);
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    const handleSubscribe = async () => {
        setSubscriptionLoading(true);
        try {
            const method = isSubscribed ? 'DELETE' : 'POST';
            const response = await fetch('/api/subscriptions', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ targetId: id })
            });

            if (response.ok) {
                setIsSubscribed(!isSubscribed);
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    setPosts(posts.filter(post => post._id !== postId));
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    {/* User Profile Header */}
                    <Card className="mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2>{profileUser?.displayName || profileUser?.username}</h2>
                                    <p className="text-muted mb-0">
                                        {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                                    </p>
                                </div>
                                {user && !isOwnProfile && (
                                    <Button
                                        variant={isSubscribed ? "outline-danger" : "primary"}
                                        onClick={handleSubscribe}
                                        disabled={subscriptionLoading}
                                    >
                                        {subscriptionLoading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            isSubscribed ? 'Unsubscribe' : 'Subscribe'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* User Posts */}
                    <h3 className="mb-3">
                        {isOwnProfile ? 'My Posts' : 'Posts by ' + (profileUser?.displayName || profileUser?.username)}
                    </h3>

                    {posts.length === 0 ? (
                        <Card>
                            <Card.Body className="text-center">
                                <p>{isOwnProfile ? 'You haven\'t created any posts yet.' : 'This user hasn\'t created any posts yet.'}</p>
                                {isOwnProfile && (
                                    <Link to="/posts/new" className="btn btn-primary">
                                        Create Your First Post
                                    </Link>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        posts.map(post => (
                            <Card key={post._id} className="mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <Card.Title>
                                                <Link 
                                                    to={`/posts/${post._id}`}
                                                    className="text-decoration-none"
                                                >
                                                    {post.title}
                                                </Link>
                                            </Card.Title>
                                            <Card.Text>
                                                {post.content.length > 200 
                                                    ? `${post.content.substring(0, 200)}...` 
                                                    : post.content
                                                }
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    {formatDate(post.createdAt)}
                                                </small>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div>
                                                        {post.tags.map((tag, index) => (
                                                            <Badge key={index} bg="secondary" className="me-1">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isOwnProfile && (
                                            <div className="ms-3">
                                                <Link 
                                                    to={`/posts/${post._id}/edit`}
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                >
                                                    Edit
                                                </Link>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDeletePost(post._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;