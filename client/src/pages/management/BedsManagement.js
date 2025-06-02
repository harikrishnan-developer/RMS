import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaPlus, FaSearch, FaTrash, FaUserAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BedFormModal from '../../components/modals/BedFormModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { deleteBed, fetchBedsByRoom } from '../../redux/slices/bedSlice';
import { fetchRoomById } from '../../redux/slices/roomSlice';

const BedsManagement = () => {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showBedModal, setShowBedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [filteredBeds, setFilteredBeds] = useState([]);

  const dispatch = useDispatch();
  const { roomBeds: beds, loading: bedsLoading, error: bedsError } = useSelector((state) => state.beds);
  const { currentRoom: room, loading: roomLoading, error: roomError } = useSelector((state) => state.rooms);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchBedsByRoom(roomId));
      dispatch(fetchRoomById(roomId));
    }
  }, [dispatch, roomId]);

  useEffect(() => {
    // Filter beds based on search term
    // Ensure beds is an array before filtering
    const bedsArray = Array.isArray(beds) ? beds : [];

    console.log('Type of beds:', typeof beds, 'Value of beds:', beds);

    if (Array.isArray(bedsArray)) {
      setFilteredBeds(
        bedsArray.filter(
          (bed) =>
            bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bed.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bed.occupant && bed.occupant.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredBeds([]);
    }
  }, [beds, searchTerm, room]); // Added room to dependency array

  const handleAddBed = () => {
    if (!room) {
      // If room data is not loaded yet, fetch it first
      dispatch(fetchRoomById(roomId));
      return;
    }
    setSelectedBed(null);
    setShowBedModal(true);
  };

  const handleEditBed = (bed) => {
    setSelectedBed(bed);
    setShowBedModal(true);
  };

  const handleDeleteClick = (bed) => {
    setSelectedBed(bed);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedBed) {
      dispatch(deleteBed(selectedBed._id));
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <Badge bg="success">Available</Badge>;
      case 'Occupied':
        return <Badge bg="danger">Occupied</Badge>;
      case 'Under Maintenance':
        return <Badge bg="warning">Under Maintenance</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render loading spinner if room or beds are loading, or if room data is not yet available
  if (roomLoading || bedsLoading || !room) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Link 
                to={room.block?._id ? `/management/rooms/${room.block._id}` : '/management/blocks'} 
                className="btn btn-outline-secondary me-2"
              >
                <FaArrowLeft /> Back to Rooms
              </Link>
              <h4 className="d-inline-block mb-0 ms-2">
                Beds in Room {room.number || ''}
              </h4>
            </div>
            {user?.role === 'systemAdmin' && (
              <Button 
                variant="primary" 
                onClick={handleAddBed}
                disabled={!room || roomLoading} // Disable button if room data is not available
              >
                <FaPlus className="me-1" /> Add Bed
              </Button>
            )}
          </div>

          {roomError && <Alert variant="danger">{roomError}</Alert>}
          {bedsError && <Alert variant="danger">{bedsError}</Alert>}

          {room && (
            <Card className="mb-3 bg-light">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <strong>Block:</strong> {room.block?.name || 'N/A'}
                  </Col>
                  <Col md={2}>
                    <strong>Room Type:</strong> {room.type || 'N/A'}
                  </Col>
                  <Col md={2}>
                    <strong>Capacity:</strong> {room.capacity || 'N/A'}
                  </Col>
                  <Col md={2}>
                    <strong>Status:</strong> {getStatusBadge(room.status || 'N/A')}
                  </Col>
                  <Col md={3}>
                    <strong>Description:</strong> {room.description || 'No description available'}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Row className="mb-3">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by bed number, status, or occupant name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Bed No.</th>
                  <th>Status</th>
                  <th>Occupant</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.length > 0 ? (
                  filteredBeds.map((bed) => (
                    <tr key={bed._id}>
                      <td>{bed.bedNumber}</td>
                      <td>{getStatusBadge(bed.status)}</td>
                      <td>
                        {bed.occupant ? (
                          <div>
                            <FaUserAlt className="me-1" />
                            {bed.occupant.name}
                          </div>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td>{bed.occupant ? formatDate(bed.occupant.checkInDate) : 'N/A'}</td>
                      <td>{bed.occupant ? formatDate(bed.occupant.checkOutDate) : 'N/A'}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditBed(bed)}
                        >
                          <FaEdit title="Edit Bed" />
                        </Button>
                        {user?.role === 'systemAdmin' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(bed)}
                          >
                            <FaTrash title="Delete Bed" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No beds found in this room
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Bed Form Modal */}
      {showBedModal && room && (
        <BedFormModal
          onClose={() => setShowBedModal(false)}
          data={{ 
            bed: selectedBed,
            roomId: roomId,
            room: room // Pass the room object directly
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Bed"
          message={`Are you sure you want to delete Bed ${selectedBed?.bedNumber}? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </Container>
  );
};

export default BedsManagement;
