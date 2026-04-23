import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (post && user && post.createdBy._id !== user._id) {
            checkSubscriptionStatus();
        }
    }, [post, user]);

    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPost(data);
            } else {
                setError('Post not found');
            }
        } catch (error) {
            setError('Error loading post');
        } finally {
            setLoading(false);
        }
    };

    const checkSubscriptionStatus = async () => {
        try {
            const response = await fetch(`/api/subscriptions/check/${post.createdBy._id}`, {
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
                body: JSON.stringify({ targetId: post.createdBy._id })
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

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`/api/posts/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <Card.Title as="h1">{post.title}</Card.Title>
                                    <div className="d-flex align-items-center">
                                        <span className="text-muted me-2">By</span>
                                        <Link 
                                            to={`/users/${post.createdBy._id}`}
                                            className="text-decoration-none fw-bold"
                                        >
                                            {post.createdBy.displayName || post.createdBy.username}
                                        </Link>
                                        {user && post.createdBy._id !== user._id && (
                                            <Button
                                                variant={isSubscribed ? "outline-danger" : "outline-primary"}
                                                size="sm"
                                                className="ms-2"
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
                                    <small className="text-muted">
                                        {formatDate(post.createdAt)}
                                    </small>
                                </div>
                                {user && post.createdBy._id === user._id && (
                                    <div>
                                        <Link 
                                            to={`/posts/${post._id}/edit`}
                                            className="btn btn-outline-primary btn-sm me-2"
                                        >
                                            Edit
                                        </Link>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Card.Text style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                {post.content}
                            </Card.Text>

                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-3">
                                    <strong>Tags: </strong>
                                    {post.tags.map((tag, index) => (
                                        <Badge key={index} bg="secondary" className="me-1">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PostDetail;