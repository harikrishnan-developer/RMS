import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Badge, ListGroup, Pagination, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../../redux/slices/notificationSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaBell, FaEye, FaTrash, FaCheckDouble } from 'react-icons/fa';

const Notifications = () => {
  const { notifications, unreadCount, loading, pagination } = useSelector((state) => state.notifications);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications(currentPage));
  }, [dispatch, currentPage]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'New Request':
        return <Badge bg="primary" className="p-2"><FaBell /></Badge>;
      case 'Request Update':
        return <Badge bg="info" className="p-2"><FaBell /></Badge>;
      case 'Room Assigned':
        return <Badge bg="success" className="p-2"><FaBell /></Badge>;
      case 'Request Rejected':
        return <Badge bg="danger" className="p-2"><FaBell /></Badge>;
      case 'Room Vacated':
        return <Badge bg="warning" className="p-2"><FaBell /></Badge>;
      case 'Payment Required':
        return <Badge bg="secondary" className="p-2"><FaBell /></Badge>;
      default:
        return <Badge bg="light" className="p-2"><FaBell /></Badge>;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Notifications</h2>
      
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              Your Notifications
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">{unreadCount} Unread</Badge>
              )}
            </h5>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <FaCheckDouble className="me-1" /> Mark All as Read
            </Button>
          )}
        </Card.Header>
        
        <Card.Body>
          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={40} className="text-muted mb-3" />
              <h5>No Notifications</h5>
              <p className="text-muted">You don't have any notifications yet.</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item 
                  key={notification._id}
                  className={`d-flex align-items-start ${!notification.isRead ? 'bg-light' : ''}`}
                >
                  <div className="me-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1 fw-bold">{notification.title}</h6>
                      <small className="text-muted ms-2">{getTimeAgo(notification.createdAt)}</small>
                    </div>
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">From: {notification.sender?.name || 'System'}</small>
                  </div>
                  <div className="ms-2 d-flex">
                    {!notification.isRead && (
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <FaEye />
                      </Button>
                    )}
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
        
        {!loading && pagination && pagination.totalPages > 1 && (
          <Card.Footer>
            <Row>
              <Col className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                  />
                </Pagination>
              </Col>
            </Row>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default Notifications;
