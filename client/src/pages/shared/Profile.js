import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { FaKey, FaUserCircle, FaUserShield } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { updatePassword, updateProfile } from '../../redux/slices/authSlice';

const Profile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePicture: null,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [validated, setValidated] = useState(false);
  const [passwordValidated, setPasswordValidated] = useState(false);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profilePicture: user.profilePicture || null,
      });
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setProfileData({
        ...profileData,
        profilePicture: files[0],
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value,
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    if (profileData.profilePicture) {
      formData.append('profilePicture', profileData.profilePicture);
    }
    
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(() => {
        // Error is handled by the redux slice
      });
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setPasswordValidated(true);
      return;
    }
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    dispatch(updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordError('');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(() => {
        // Error is handled by the redux slice
      });
  };
  
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'systemAdmin':
        return 'bg-danger';
      case 'admin':
        return 'bg-primary';
      case 'blockHead':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };
  
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'systemAdmin':
        return 'System Administrator';
      case 'admin':
        return 'Administrator';
      case 'blockHead':
        return 'Block Head';
      default:
        return role;
    }
  };
  
  if (!user) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <h2 className="mb-4">My Profile</h2>
      
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col lg={4} md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-placeholder bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
                {profileData.profilePicture ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} 
                    alt="Profile" 
                    className="img-fluid rounded-circle"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle size={80} className="text-secondary" />
                )}
              </div>
              <h4>{user.name}</h4>
              <p className="text-muted mb-1">{user.email}</p>
              <p className="mb-3">
                <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                  {getRoleDisplay(user.role)}
                </span>
              </p>
            </Card.Body>
          </Card>
          
          {user.role === 'blockHead' && user.assignedBlocks && (
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Assigned Blocks</h5>
              </Card.Header>
              <Card.Body>
                {user.assignedBlocks.length === 0 ? (
                  <p className="text-muted">No blocks assigned</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {user.assignedBlocks.map((block) => (
                      <li key={block._id} className="list-group-item">
                        {block.name}
                      </li>
                    ))}
                  </ul>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col lg={8} md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-3">
                <Tab eventKey="profile" title={<><FaUserCircle className="me-2" />Profile</>}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form noValidate validated={validated} onSubmit={handleProfileSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your name.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid email.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="profilePicture">
                      <Form.Label>Profile Picture</Form.Label>
                      <Form.Control
                        type="file"
                        name="profilePicture"
                        onChange={handleProfileChange}
                        accept="image/*"
                      />
                      <Form.Text className="text-muted">
                        Upload a profile picture (max 5MB, JPG, PNG, or GIF)
                      </Form.Text>
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <LoadingSpinner /> : 'Update Profile'}
                    </Button>
                  </Form>
                </Tab>
                
                <Tab eventKey="password" title={<><FaKey className="me-2" />Password</>}>
                  {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                  
                  <Form noValidate validated={passwordValidated} onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3" controlId="currentPassword">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter your current password.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                      <Form.Control.Feedback type="invalid">
                        New password must be at least 6 characters.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please confirm your new password.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <LoadingSpinner /> : 'Update Password'}
                    </Button>
                  </Form>
                </Tab>
                
                <Tab eventKey="account" title={<><FaUserShield className="me-2" />Account</>}>
                  <div className="py-2">
                    <h5>Account Information</h5>
                    <p className="text-muted">Basic account information</p>
                    
                    <Row className="mb-3">
                      <Col sm={3}>
                        <strong>User ID</strong>
                      </Col>
                      <Col sm={9}>
                        <code>{user._id}</code>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col sm={3}>
                        <strong>Role</strong>
                      </Col>
                      <Col sm={9}>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {getRoleDisplay(user.role)}
                        </span>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col sm={3}>
                        <strong>Account Created</strong>
                      </Col>
                      <Col sm={9}>
                        {new Date(user.createdAt).toLocaleString()}
                      </Col>
                    </Row>
                    
                    <div className="alert alert-info mt-3">
                      <h6>Need help?</h6>
                      <p className="mb-0">
                        Contact the system administrator if you need to change your role or have account-related issues.
                      </p>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
