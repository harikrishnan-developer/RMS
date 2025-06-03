import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchRooms, resetRoomState } from '../../redux/slices/roomSlice';

const SelectRoomForBeds = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blockId } = useParams();

  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchRooms({ blockId }));
    return () => {
      dispatch(resetRoomState());
    };
  }, [dispatch, blockId]);

  const handleSelectRoom = (roomId) => {
    navigate(`/management/beds/${roomId}`);
  };

  const filteredRooms = rooms.filter(room =>
    room.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.block?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Rooms state:', rooms);
  console.log('Filtered rooms:', filteredRooms);

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4">Select a Room to Manage Beds</h4>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by room number or block name"
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
                  <th>Block Name</th>
                  <th>Room Number</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room._id}>
                    <td>{room.block?.name || 'N/A'}</td>
                    <td>{room.number}</td>
                    <td>{room.capacity}</td>
                    <td>{room.occupiedBedsCount || 0}</td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => handleSelectRoom(room._id)}>
                        Manage Beds
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRooms.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No rooms found
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

export default SelectRoomForBeds; 