import React, { useEffect } from 'react';
import { Button, Card, Container, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchRooms } from '../../redux/slices/roomSlice'; // Assuming fetchRooms exists

const SelectRoomForBeds = () => {
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);

  useEffect(() => {
    // Fetch all rooms if they are not already loaded
    if (!rooms || rooms.length === 0) {
      dispatch(fetchRooms());
    }
  }, [dispatch, rooms]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="alert alert-danger">Error loading rooms: {error}</div>;
  }

  return (
    <Container>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4">Select Room to Manage Beds</h4>
          {rooms && rooms.length > 0 ? (
            <Table striped hover>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Block</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room._id}>
                    <td>{room.number}</td>
                    <td>{room.type}</td>
                    <td>{room.block?.name || 'N/A'}</td>
                    <td>
                      <Button 
                        as={Link} 
                        to={`/management/beds/${room._id}`} 
                        variant="primary" 
                        size="sm"
                      >
                        Manage Beds
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No rooms found. Please add rooms first.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SelectRoomForBeds; 