import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unsubscribeLoading, setUnsubscribeLoading] = useState({});

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/subscriptions', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data);
            } else {
                setError('Failed to load subscriptions');
            }
        } catch (error) {
            setError('Error loading subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async (targetId, authorName) => {
        if (!window.confirm(`Are you sure you want to unsubscribe from ${authorName}?`)) {
            return;
        }

        setUnsubscribeLoading(prev => ({ ...prev, [targetId]: true }));
        
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ targetId })
            });

            if (response.ok) {
                setSubscriptions(prev => prev.filter(sub => sub.targetId._id !== targetId));
            } else {
                setError('Failed to unsubscribe');
            }
        } catch (error) {
            setError('Error unsubscribing');
        } finally {
            setUnsubscribeLoading(prev => ({ ...prev, [targetId]: false }));
        }
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

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Subscriptions</h2>
                        <span className="text-muted">
                            {subscriptions.length} {subscriptions.length === 1 ? 'subscription' : 'subscriptions'}
                        </span>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {subscriptions.length === 0 ? (
                        <Card>
                            <Card.Body className="text-center py-5">
                                <h5>No Subscriptions Yet</h5>
                                <p className="text-muted mb-3">
                                    You haven't subscribed to any authors yet. 
                                    Browse posts and subscribe to authors to get notified when they publish new content.
                                </p>
                                <Link to="/" className="btn btn-primary">
                                    Browse Posts
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {subscriptions.map((subscription) => (
                                <Card key={subscription._id} className="mb-3">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                {subscription.targetId.profilePicture && (
                                                    <Image
                                                        src={subscription.targetId.profilePicture || "/placeholder.svg"}
                                                        roundedCircle
                                                        width="50"
                                                        height="50"
                                                        className="me-3"
                                                        alt={subscription.targetId.displayName || subscription.targetId.username}
                                                    />
                                                )}
                                                <div>
                                                    <h5 className="mb-1">
                                                        <Link 
                                                            to={`/users/${subscription.targetId._id}`}
                                                            className="text-decoration-none"
                                                        >
                                                            {subscription.targetId.displayName || subscription.targetId.username}
                                                        </Link>
                                                    </h5>
                                                    <small className="text-muted">
                                                        @{subscription.targetId.username}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Link 
                                                    to={`/users/${subscription.targetId._id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    View Profile
                                                </Link>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleUnsubscribe(
                                                        subscription.targetId._id,
                                                        subscription.targetId.displayName || subscription.targetId.username
                                                    )}
                                                    disabled={unsubscribeLoading[subscription.targetId._id]}
                                                >
                                                    {unsubscribeLoading[subscription.targetId._id] ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" className="me-1" />
                                                            Unsubscribing...
                                                        </>
                                                    ) : (
                                                        'Unsubscribe'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Quick Stats */}
                    {subscriptions.length > 0 && (
                        <Card className="mt-4 bg-light">
                            <Card.Body>
                                <h6>Subscription Stats</h6>
                                <p className="mb-0 text-muted">
                                    You're subscribed to {subscriptions.length} {subscriptions.length === 1 ? 'author' : 'authors'}. 
                                    You'll receive notifications when they publish new posts.
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Subscriptions;