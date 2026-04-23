import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const { user, login, loading, checkAuthStatus } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to="/" replace />;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');                   // Clear error when user types
    };

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh auth status and redirect
                await checkAuthStatus();
                window.location.href = '/';
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh auth status and redirect
                await checkAuthStatus();
                window.location.href = '/';
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Welcome to Blog</Card.Title>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <div className="d-grid gap-2 mb-4">
                                <Button 
                                    variant="danger" 
                                    size="lg" 
                                    onClick={login}
                                >
                                    🔍 Continue with Google
                                </Button>
                            </div>
                            
                            <hr />
                            
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => {
                                    setActiveTab(k);
                                    setError('');
                                    setFormData({ username: '', password: '', confirmPassword: '' });
                                }}
                                className="mb-3"
                            >
                                <Tab eventKey="login" title="Login">
                                    <Form onSubmit={handleLocalLogin}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your username"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your password"
                                            />
                                        </Form.Group>
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            className="w-100"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Logging in...' : 'Login'}
                                        </Button>
                                    </Form>
                                </Tab>
                                
                                <Tab eventKey="register" title="Register">
                                    <Form onSubmit={handleRegister}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="Choose a username"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                                placeholder="Choose a password (min 6 characters)"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                placeholder="Confirm your password"
                                            />
                                        </Form.Group>
                                        <Button 
                                            type="submit" 
                                            variant="success" 
                                            className="w-100"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    </Form>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;