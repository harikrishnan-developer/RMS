import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaArrowLeft, FaBed, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
// Import room actions
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import RoomFormModal from '../../components/modals/RoomFormModal';
import { fetchBlockById, fetchBlocks } from '../../redux/slices/blockSlice';
import { deleteRoom, fetchRoomsByBlock } from '../../redux/slices/roomSlice';

const RoomsManagement = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const dispatch = useDispatch();
  // Use actual data from Redux state
  const { blockRooms: rooms, loading: roomsLoading, error: roomsError } = useSelector((state) => state.rooms);
  const { currentBlock: block, blocks, loading: blockLoading, error: blockError } = useSelector((state) => state.blocks);
  const { user } = useSelector((state) => state.auth);
  
  // Redirect block head to their assigned block's rooms if no blockId is in URL
  useEffect(() => {
    if (user?.role === 'blockHead' && user?.block?._id && !blockId) {
      navigate(`/management/blocks/${user.block._id}/rooms`, { replace: true });
    }
  }, [user, blockId, navigate]);
  
  useEffect(() => {
    if (blockId) {
      dispatch(fetchRoomsByBlock(blockId));
      dispatch(fetchBlockById(blockId));
    } else {
      // Only fetch all blocks if not a block head or block head without assigned block
      if (!(user?.role === 'blockHead' && user?.block?._id)) {
      dispatch(fetchBlocks());
      }
    }
  }, [dispatch, blockId, user]);

  useEffect(() => {
    // Filter rooms based on search term
    if (rooms) {
      const roomsArray = Array.isArray(rooms) ? rooms : rooms?.data || [];
      setFilteredRooms(
        roomsArray.filter(
          (room) =>
            room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (room.amenities && room.amenities.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
       setFilteredRooms([]);
    }
  }, [rooms, searchTerm]);

  const handleAddRoom = () => {
    if (!block?.data) {
      // If block data is not loaded yet, fetch it first
      dispatch(fetchBlockById(blockId));
      return;
    }
    setSelectedRoom(null);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteClick = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedRoom) {
      // Dispatch deleteRoom action
      dispatch(deleteRoom(selectedRoom._id));
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

  const getAvailabilityBadge = (available, total) => {
    if (available === undefined || total === undefined) return <Badge bg="secondary">N/A</Badge>;
    if (available === 0) {
      return <Badge bg="danger">{available}/{total}</Badge>;
    } else if (available === total) {
      return <Badge bg="success">{available}/{total}</Badge>;
    } else {
      return <Badge bg="warning">{available}/{total}</Badge>;
    }
  };

  // Render different UI based on whether blockId is provided or if the user is a block head
  if (user?.role === 'blockHead' && user?.block?._id && !blockId) {
     // We are redirecting, show a loading spinner or null
     return <LoadingSpinner />;
  }


  if (blockLoading || roomsLoading) return <LoadingSpinner />;

  // If no blockId is provided (and not a block head being redirected), show the blocks list
  if (!blockId) {
    return (
      <Container fluid>
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Select a Block to Manage Rooms</h4>
            </div>

            {blockError && <Alert variant="danger">{blockError}</Alert>}

            <Row>
              {blocks && blocks.length > 0 ? (
                blocks.map((block) => (
                  <Col key={block._id} md={4} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <h5>{block.name}</h5>
                        <p className="text-muted">{block.type}</p>
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/management/blocks/${block._id}/rooms`)}
                        >
                          Manage Rooms
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <Alert variant="info">No blocks found. Please create a block first.</Alert>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // If blockId is provided, show the rooms list
  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Link to="/management/rooms" className="btn btn-outline-secondary me-2">
                <FaArrowLeft /> Back to Blocks
              </Link>
              <h4 className="d-inline-block mb-0 ms-2">
                Rooms in {block?.data?.name || 'Block'}
              </h4>
            </div>
            {user?.role === 'systemAdmin' && (
            <Button 
              variant="primary" 
              onClick={handleAddRoom}
              disabled={!block?.data || blockLoading}
            >
              <FaPlus className="me-1" /> Add Room
            </Button>
            )}
          </div>

          {blockError && <Alert variant="danger">{blockError}</Alert>}
          {roomsError && <Alert variant="danger">{roomsError}</Alert>}

          {block?.data && (
            <Card className="mb-3 bg-light">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <strong>Block Type:</strong> {block.data.type || 'N/A'}
                  </Col>
                  <Col md={3}>
                    <strong>Block Head:</strong> {block.data.blockHead?.name || 'Unassigned'}
                  </Col>
                  <Col md={6}>
                    <strong>Description:</strong> {block.data.description || 'No description available'}
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
                  placeholder="Search by room number, type, or status"
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
                  <th>Room Number</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Beds (Available/Total)</th>
                  <th>Occupants</th>
                  <th>Price Per Day</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                    <tr key={room._id}>
                      <td>{room.number}</td>
                      <td>{room.type}</td>
                      <td>{getStatusBadge(room.status)}</td>
                      <td>{getAvailabilityBadge(room.availableBeds, room.totalBeds)}</td>
                    <td>
                      {room.beds?.filter(bed => bed.status === 'Occupied').map(bed => (
                        <div key={bed._id} className="mb-1">
                          <small>
                            <strong>Bed {bed.number}:</strong> {bed.occupant?.name}
                            <br />
                            <span className="text-muted">
                              Check-in: {new Date(bed.occupant?.checkInDate).toLocaleDateString()}
                              {bed.occupant?.checkOutDate && (
                                <> | Check-out: {new Date(bed.occupant?.checkOutDate).toLocaleDateString()}</>
                              )}
                            </span>
                          </small>
                        </div>
                      ))}
                      {(!room.beds || room.beds.filter(bed => bed.status === 'Occupied').length === 0) && (
                        <small className="text-muted">No occupants</small>
                      )}
                    </td>
                    <td>{room.pricePerDay || 'N/A'}</td>
                    <td>{room.amenities?.join(', ') || 'N/A'}</td>
                    <td>
                      <Link to={`/management/beds/${room._id}`} className="btn btn-outline-info btn-sm me-1">
                        <FaBed title="Manage Beds" />
                      </Link>
                    {user?.role === 'systemAdmin' && (
                      <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEditRoom(room)}
                      >
                        <FaEdit title="Edit Room" />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(room)}
                      >
                        <FaTrash title="Delete Room" />
                      </Button>
                      </>
                    )}
                    </td>
                  </tr>
                ))}
                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No rooms found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Room Form Modal for adding/editing rooms */}
      {showRoomModal && (
        <RoomFormModal 
          onClose={() => setShowRoomModal(false)} 
          data={selectedRoom ? { room: selectedRoom } : { blockId: blockId || user?.block?._id }}
        />
      )}

      {/* Confirmation Modal for deleting rooms */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          message={`Are you sure you want to delete room "${selectedRoom?.number}"?`}
        />
      )}
    </Container>
  );
};

export default RoomsManagement;
