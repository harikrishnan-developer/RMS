import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BedFormModal from '../../components/modals/BedFormModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import EarlyVacateModal from '../../components/modals/EarlyVacateModal';
import { deleteBed, fetchBedsByRoom, fetchEarlyVacateHistory, vacateBed } from '../../redux/slices/bedSlice';
import { fetchRoomById } from '../../redux/slices/roomSlice';

const BedsManagement = () => {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showBedModal, setShowBedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEarlyVacateModal, setShowEarlyVacateModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedBedForVacate, setSelectedBedForVacate] = useState(null);
  const [filteredBeds, setFilteredBeds] = useState([]);
  const [modalMode, setModalMode] = useState(null);

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
  }, [beds, searchTerm, room]);

  const handleAddBed = () => {
    if (!roomId) {
      console.error('Room ID is not available to add a bed.');
      // Optionally show an alert to the user
      // setBedsError('Cannot add bed: Room ID is missing.');
      return;
    }
    setSelectedBed(null);
    setModalMode('add');
    // Explicitly pass roomId when adding a new bed
    setShowBedModal(true);
  };

  const handleEditBed = (bed) => {
    setSelectedBed(bed);
    setModalMode('edit');
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

  const handleAssignBed = async (bed) => {
    setSelectedBed(bed);
    setModalMode('assign');
    setShowBedModal(true);
  };

  const handleVacateBed = async (bed) => {
    const today = new Date();
    const checkOutDate = new Date(bed.occupant?.checkOutDate);
    
    if (checkOutDate > today) {
      // If check-out date is in the future, show early vacate modal
      setSelectedBedForVacate(bed);
      setShowEarlyVacateModal(true);
    } else {
      // If check-out date has passed, proceed with normal vacate
      try {
        await dispatch(vacateBed(bed._id)).unwrap();
        dispatch(fetchBedsByRoom(roomId));
      } catch (error) {
        console.error('Failed to vacate bed:', error);
      }
    }
  };

  const handleEarlyVacate = async (vacateData) => {
    try {
      console.log('Processing early vacate with data:', vacateData);
      await dispatch(vacateBed({
        bedId: selectedBedForVacate._id,
        earlyVacateData: vacateData
      })).unwrap();
      
      // Refresh the beds list
      dispatch(fetchBedsByRoom(roomId));
      
      // Refresh early vacate history
      dispatch(fetchEarlyVacateHistory());
      
      // Close the modal
      setShowEarlyVacateModal(false);
      setSelectedBedForVacate(null);
    } catch (error) {
      console.error('Failed to process early vacate:', error);
    }
  };

  // Add new function to handle modal close
  const handleModalClose = () => {
    setShowBedModal(false);
    setSelectedBed(null);
    setSelectedBedForVacate(null);
    setModalMode(null);
    // Refresh beds list after any bed operation
    dispatch(fetchBedsByRoom(roomId));
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
                to={room.block?._id ? `/management/blocks/${room.block._id}/rooms` : '/management/blocks'} 
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
                  <th>Bed Number</th>
                  <th>Status</th>
                  <th>Occupant</th>
                  <th>Check-in Date</th>
                  <th>Check-out Date</th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map((bed) => (
                    <tr key={bed._id}>
                      <td>{bed.bedNumber}</td>
                      <td>{getStatusBadge(bed.status)}</td>
                      <td>{bed.occupant?.name || 'Unoccupied'}</td>
                      <td>{formatDate(bed.occupant?.checkInDate)}</td>
                      <td>{formatDate(bed.occupant?.checkOutDate)}</td>
                      <td>{bed.occupant?.purpose || 'N/A'}</td>
                      <td>
                        {user?.role === 'systemAdmin' && (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditBed(bed)}
                              title="Edit Bed"
                            >
                              <FaEdit className="me-1" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(bed)}
                              title="Delete Bed"
                            >
                              <FaTrash className="me-1" />
                            </Button>
                          </>
                        )}
                        {user?.role !== 'systemAdmin' && bed.status === 'Occupied' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleVacateBed(bed)}
                              title="Vacate Bed"
                            >
                              Vacate
                            </Button>
                        )}
                         {user?.role !== 'systemAdmin' && bed.status === 'Available' && (
                             <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleAssignBed(bed)}
                              title="Assign Bed"
                            >
                              Assign
                            </Button>
                         )}
                      </td>
                    </tr>
                ))}
                {filteredBeds.length === 0 && !bedsLoading && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No beds found for this room.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Bed Form Modal for Add/Edit/Assign */}
      <BedFormModal
        show={showBedModal}
        onClose={handleModalClose}
        data={{
          room: room,
          bed: selectedBed,
          mode: modalMode,
          roomId: roomId
        }}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        body={`Are you sure you want to delete bed number ${selectedBed?.bedNumber}? This action cannot be undone.`}
      />
      
      {/* Early Vacate Modal */}
      <EarlyVacateModal
        show={showEarlyVacateModal}
        onClose={() => setShowEarlyVacateModal(false)}
        onConfirm={handleEarlyVacate}
        bed={selectedBedForVacate}
      />

    </Container>
  );
};

export default BedsManagement;
