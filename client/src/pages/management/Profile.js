import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, updateProfile } from '../../redux/slices/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch latest user data when the component mounts
    dispatch(fetchUserData());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setMessage(`Error: ${error}`);
    }
  }, [error]);

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setMessage('Profile updated successfully!');
      // Optionally refetch user data to ensure profile picture URL is updated
      dispatch(fetchUserData()); 
    } catch (err) {
      setMessage(`Failed to update profile: ${err}`);
    }
  };

  // Helper function to get the full image URL
  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) {
      return '/images/default-avatar.png'; // Default avatar
    }
    // Assuming your backend serves static files from /public/uploads
    return `http://localhost:5000/${picturePath.replace('public/', '')}`;
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Profile</Card.Title>
        {message && <Alert variant={message.includes('Error') || message.includes('Failed') ? 'danger' : 'success'}>{message}</Alert>}
        <div className="text-center mb-4">
          <img
            src={getProfilePictureUrl(user?.profilePicture)}
            alt="Profile Avatar"
            className="rounded-circle"
            width="150"
            height="150"
          />
        </div>
        <Form onSubmit={handleProfileSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled // Prevent changing email via profile for now
            />
          </Form.Group>

          <Form.Group controlId="profilePicture" className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
          </Form.Group>
          
          {/* Display Assigned Blocks for Block Head */}
          {user?.role === 'blockHead' && (
            <Form.Group className="mb-3">
              <Form.Label>Assigned Blocks:</Form.Label>
              <ul>
                {user?.assignedBlocks?.map(block => (
                  <li key={block._id}>{block.name}</li>
                ))}
              </ul>
              {(!user?.assignedBlocks || user?.assignedBlocks.length === 0) && (
                <p>No blocks assigned.</p>
              )}
            </Form.Group>
          )}


          <Button variant="primary" type="submit">
            Update Profile
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Profile; 