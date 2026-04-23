import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;