import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchBedsByRoom } from '../../redux/slices/bedSlice';
import { fetchRoomById } from '../../redux/slices/roomSlice';

const OccupantsManagement = () => {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOccupants, setFilteredOccupants] = useState([]);
  const dispatch = useDispatch();
  const { roomBeds: beds, loading: bedsLoading, error: bedsError } = useSelector((state) => state.beds);
  const { currentRoom: room, loading: roomLoading, error: roomError } = useSelector((state) => state.rooms);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchBedsByRoom(roomId));
      dispatch(fetchRoomById(roomId));
    }
  }, [dispatch, roomId]);

  useEffect(() => {
    if (beds && Array.isArray(beds)) {
      const filtered = beds.filter(bed => 
        bed.status === 'Occupied' && (
          bed.occupant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.occupant?.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.occupant?.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bed.bedNumber?.toString().includes(searchTerm)
        )
      );
      setFilteredOccupants(filtered);
    } else {
      setFilteredOccupants([]);
    }
  }, [beds, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
                Occupants in Room {room.number || ''}
              </h4>
            </div>
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
                    <strong>Status:</strong> {room.status || 'N/A'}
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
                  placeholder="Search by name, contact info, purpose, or bed number"
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
                  <th>Occupant Name</th>
                  <th>Contact Info</th>
                  <th>Check-in Date</th>
                  <th>Check-out Date</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filteredOccupants.map((bed) => (
                  <tr key={bed._id}>
                    <td>{bed.bedNumber}</td>
                    <td>{bed.occupant?.name || 'N/A'}</td>
                    <td>{bed.occupant?.contactInfo || 'N/A'}</td>
                    <td>{formatDate(bed.occupant?.checkInDate)}</td>
                    <td>{formatDate(bed.occupant?.checkOutDate)}</td>
                    <td>{bed.occupant?.purpose || 'N/A'}</td>
                  </tr>
                ))}
                {filteredOccupants.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No occupants found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OccupantsManagement; 