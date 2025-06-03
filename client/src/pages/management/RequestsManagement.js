import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Modal, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { FaCheck, FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import RequestFormModal from '../../components/modals/RequestFormModal';
import { fetchBlocks } from '../../redux/slices/blockSlice';
import { deleteRequest, fetchRequests, updateRequestStatus } from '../../redux/slices/requestSlice';

const RequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();
  const { requests, loading, error } = useSelector((state) => state.requests);
  const { user } = useSelector((state) => state.auth);

  // Get status from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get('status')?.toLowerCase() || 'pending';
  const [activeTab, setActiveTab] = useState(statusFromUrl);

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchBlocks());
  }, [dispatch]);

  useEffect(() => {
    // Update active tab when URL changes
    const status = queryParams.get('status')?.toLowerCase() || 'pending';
    setActiveTab(status);
  }, [location.search]);

  useEffect(() => {
    // Filter requests based on search term and active tab
    if (requests) {
      const filtered = requests.filter(
        (request) =>
          (activeTab === 'all' || (request.status && request.status.toLowerCase() === activeTab.toLowerCase())) &&
          ((request.requestNumber && request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (request.requesterName && request.requesterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (request.requesterContact && request.requesterContact.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (request.purpose && request.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (request.blockPreference && request.blockPreference.name && request.blockPreference.name.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredRequests(filtered);
    }
  }, [requests, searchTerm, activeTab]);

  const handleAddRequest = () => {
    setSelectedRequest(null);
    setShowRequestModal(true);
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    console.log('RequestsManagement - selectedRequest after setting for edit:', request);
    setShowRequestModal(true);
  };

  const handleDeleteClick = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApproveRequest = (request) => {
    dispatch(updateRequestStatus({ id: request._id, status: 'Approved' }));
  };

  const handleRejectRequest = (request) => {
    dispatch(updateRequestStatus({ id: request._id, status: 'Rejected' }));
  };

  const handleCompleteRequest = (request) => {
    dispatch(updateRequestStatus({ id: request._id, status: 'Completed' }));
  };

  const confirmDelete = () => {
    if (selectedRequest) {
      dispatch(deleteRequest(selectedRequest._id));
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'Approved':
        return <Badge bg="success">Approved</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'Completed':
        return <Badge bg="info">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Accommodation Requests</h4>
            {user?.role === 'admin' && (
            <Button variant="primary" onClick={handleAddRequest}>
              <FaPlus className="me-1" /> New Request
            </Button>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="pending" title="Pending">
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                      <th>Request No.</th>
                  <th>Requester</th>
                      <th>Purpose</th>
                  <th>Block</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.requestNumber}</td>
                          <td>{request.requesterName}</td>
                          <td>{request.purpose}</td>
                          <td>{request.blockPreference?.name}</td>
                          <td>{formatDate(request.checkInDate)}</td>
                          <td>{formatDate(request.checkOutDate)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleViewDetails(request)}
                            >
                              <FaEye title="View Details" />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleApproveRequest(request)}
                              disabled={request.status !== 'Pending'}
                            >
                              <FaCheck title="Approve" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => handleRejectRequest(request)}
                              disabled={request.status !== 'Pending'}
                            >
                              <FaTimes title="Reject" />
                            </Button>
                            {request.status === 'Approved' && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleCompleteRequest(request)}
                              >
                                <FaCheck title="Mark as Completed" /> Mark Completed
                              </Button>
                            )}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditRequest(request)}
                            >
                              <FaEdit title="Edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(request)}
                            >
                              <FaTrash title="Delete" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No requests found
                      </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="approved" title="Approved">
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Request No.</th>
                      <th>Requester</th>
                      <th>Purpose</th>
                      <th>Block</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestNumber}</td>
                          <td>{request.requesterName}</td>
                          <td>{request.purpose}</td>
                          <td>{request.blockPreference?.name}</td>
                      <td>{formatDate(request.checkInDate)}</td>
                      <td>{formatDate(request.checkOutDate)}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewDetails(request)}
                        >
                          <FaEye title="View Details" />
                        </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleApproveRequest(request)}
                              disabled={request.status !== 'Pending'}
                            >
                              <FaCheck title="Approve" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => handleRejectRequest(request)}
                              disabled={request.status !== 'Pending'}
                            >
                              <FaTimes title="Reject" />
                            </Button>
                            {request.status === 'Approved' && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleCompleteRequest(request)}
                              >
                                <FaCheck title="Mark as Completed" /> Mark Completed
                              </Button>
                            )}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditRequest(request)}
                            >
                              <FaEdit title="Edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(request)}
                            >
                              <FaTrash title="Delete" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="rejected" title="Rejected">
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Request No.</th>
                      <th>Requester</th>
                      <th>Purpose</th>
                      <th>Block</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestNumber}</td>
                          <td>{request.requesterName}</td>
                          <td>{request.purpose}</td>
                          <td>{request.blockPreference?.name}</td>
                          <td>{formatDate(request.checkInDate)}</td>
                          <td>{formatDate(request.checkOutDate)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleViewDetails(request)}
                            >
                              <FaEye title="View Details" />
                            </Button>
                             <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditRequest(request)}
                            >
                              <FaEdit title="Edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(request)}
                            >
                              <FaTrash title="Delete" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="completed" title="Completed">
               <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Request No.</th>
                      <th>Requester</th>
                      <th>Purpose</th>
                      <th>Block</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestNumber}</td>
                          <td>{request.requesterName}</td>
                          <td>{request.purpose}</td>
                          <td>{request.blockPreference?.name}</td>
                          <td>{formatDate(request.checkInDate)}</td>
                          <td>{formatDate(request.checkOutDate)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleViewDetails(request)}
                            >
                              <FaEye title="View Details" />
                            </Button>
                             <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditRequest(request)}
                            >
                              <FaEdit title="Edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(request)}
                            >
                              <FaTrash title="Delete" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="all" title="All">
               <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Request No.</th>
                      <th>Requester</th>
                      <th>Purpose</th>
                      <th>Block</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestNumber}</td>
                          <td>{request.requesterName}</td>
                          <td>{request.purpose}</td>
                          <td>{request.blockPreference?.name}</td>
                          <td>{formatDate(request.checkInDate)}</td>
                          <td>{formatDate(request.checkOutDate)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleViewDetails(request)}
                            >
                              <FaEye title="View Details" />
                            </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditRequest(request)}
                        >
                          <FaEdit title="Edit" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(request)}
                        >
                          <FaTrash title="Delete" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Request Form Modal */}
      {showRequestModal && (
        <RequestFormModal
          show={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
          }}
          data={selectedRequest}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          message={`Are you sure you want to delete request "${selectedRequest?.requestNumber}"?`}
        />
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <Modal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Request Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <p><strong>Request Number:</strong> {selectedRequest.requestNumber}</p>
                <p><strong>Requester Name:</strong> {selectedRequest.requesterName}</p>
                <p><strong>Contact:</strong> {selectedRequest.requesterContact}</p>
                <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
              </Col>
              <Col md={6}>
                <p><strong>Block:</strong> {selectedRequest.blockPreference?.name}</p>
                <p><strong>Room Type:</strong> {selectedRequest.roomTypePreference}</p>
                <p><strong>Check In:</strong> {formatDate(selectedRequest.checkInDate)}</p>
                <p><strong>Check Out:</strong> {formatDate(selectedRequest.checkOutDate)}</p>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                <p><strong>Created At:</strong> {formatDate(selectedRequest.createdAt)}</p>
                {selectedRequest.assignedRoom && (
                  <p><strong>Assigned Room:</strong> {selectedRequest.assignedRoom.number}</p>
                )}
                {selectedRequest.assignedBed && (
                  <p><strong>Assigned Bed:</strong> {selectedRequest.assignedBed.bedNumber}</p>
            )}
            {selectedRequest.notes && (
                  <p><strong>Notes:</strong> {selectedRequest.notes}</p>
            )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default RequestsManagement;
