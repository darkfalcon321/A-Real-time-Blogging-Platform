import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'react-bootstrap-icons';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
        fetchUsers();
    }, []);

const fetchPosts = async (searchQuery = '') => {            //find posts
    try {
        console.log('Fetching posts with search:', searchQuery);
        const response = await fetch(`/api/posts?search=${searchQuery}`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Posts response status:', response.status);
        console.log('Posts response headers:', response.headers.get('content-type'));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Posts data received:', data);
            setPosts(Array.isArray(data) ? data : []);
        } else {
            console.log('Posts API failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error response:', errorText);
            setPosts([]);
        }
    } catch (error) {
        console.log('Error fetching posts:', error);
        setPosts([]);
    } finally {
        setLoading(false);
    }
};

const fetchUsers = async () => {
    try {
        console.log('Fetching users...');
        const response = await fetch('/api/users', {
            credentials: 'include'
        });
        
        console.log('Users response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Users data received:', data);
            setUsers(Array.isArray(data) ? data : []);
        } else {
            console.log('Users API failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error response:', errorText);
            setUsers([]);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
    }
};

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts(search);
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

    return (
        <Container className="mt-4">
            <Row>
                {/* Left Panel - Active Users */}
                <Col md={3}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">Active Users</h6>
                        </Card.Header>
                        <Card.Body>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map(activeUser => (
                                    <div key={activeUser._id} className="mb-2">
                                        <Link 
                                            to={`/users/${activeUser._id}`}
                                            className="text-decoration-none"
                                        >
                                            {activeUser.displayName || activeUser.username}
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No users found</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Main Content - Posts */}
                <Col md={6}>
                    <h1 className="mb-4">Blog Posts</h1>
                    
                    {posts.length === 0 ? (
                        <Card>
                            <Card.Body className="text-center">
                                <p>No posts found.</p>
                                {user && (
                                    <Link to="/posts/new" className="btn btn-primary">
                                        Create First Post
                                    </Link>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        posts.map(post => (
                            <Card key={post._id} className="mb-3">
                                <Card.Body>
                                    <Card.Title>
                                        <Link 
                                            to={`/posts/${post._id}`}
                                            className="text-decoration-none"
                                        >
                                            {post.title}
                                        </Link>
                                    </Card.Title>
                                    <Card.Text>
                                        {post.content.length > 150 
                                            ? `${post.content.substring(0, 150)}...` 
                                            : post.content
                                        }
                                    </Card.Text>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            By{' '}
                                            <Link 
                                                to={`/users/${post.createdBy._id}`}
                                                className="text-decoration-none"
                                            >
                                                {post.createdBy.displayName || post.createdBy.username}
                                            </Link>
                                            {' '}on {formatDate(post.createdAt)}
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
                                    {user && post.createdBy._id === user._id && (
                                        <div className="mt-2">
                                            <Link 
                                                to={`/posts/${post._id}/edit`}
                                                className="btn btn-sm btn-outline-primary me-2"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>

                {/* Right Panel - Search */}
                <Col md={3}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">Search Posts</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by title or tags..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <Button variant="outline-secondary" type="submit">
                                        <Search />
                                    </Button>
                                </InputGroup>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;