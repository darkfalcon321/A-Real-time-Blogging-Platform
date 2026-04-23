import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const PostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingPost, setFetchingPost] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            fetchPost();
        }
    }, [id, isEditing]);

    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const post = await response.json();
                // Check if user owns this post
                if (post.createdBy._id !== user._id) {
                    navigate('/');
                    return;
                }
                setFormData({
                    title: post.title,
                    content: post.content,
                    tags: post.tags ? post.tags.join(', ') : ''
                });
            } else {
                setError('Post not found');
            }
        } catch (error) {
            setError('Error loading post');
        } finally {
            setFetchingPost(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEditing ? `/api/posts/${id}` : '/api/posts';
            const method = isEditing ? 'PUT' : 'POST';

            console.log('Submitting post:', { url, method, formData });

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            if (response.ok) {
                const post = await response.json();
                console.log('Post created/updated successfully:', post);
                navigate(`/posts/${post._id}`);
            } else {
                // Log the actual error response
                const errorText = await response.text();
                console.log('Error response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    setError(errorData.error || 'Failed to save post');
                } catch {
                    setError(`Failed to save post (Status: ${response.status})`);
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('Network error - please try again');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingPost) {
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
                    <Card>
                        <Card.Header>
                            <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter post title"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                        placeholder="Write your post content here..."
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tags</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="Enter tags separated by commas (e.g., technology, programming, web)"
                                    />
                                    <Form.Text className="text-muted">
                                        Separate multiple tags with commas
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                {isEditing ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            isEditing ? 'Update Post' : 'Create Post'
                                        )}
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/')}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PostForm;