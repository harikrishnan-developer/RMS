import React from 'react';
import { Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';

const Header = ({ onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
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
        return 'System Admin';
      case 'admin':
        return 'Admin';
      case 'blockHead':
        return 'Block Head';
      default:
        return role;
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <Button 
          variant="light" 
          className="border-0 me-2" 
          onClick={onToggleSidebar}
        >
          <FaBars />
        </Button>
        
        <Navbar.Brand>Room & Facility Management</Navbar.Brand>
        
        <div className="ms-auto d-flex align-items-center">
          {/* Notifications Button */}
          <Button 
            variant="light" 
            className="border-0 position-relative me-2" 
            onClick={handleNotificationsClick}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Button>
          
          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="dropdown-user" className="border-0">
              <FaUserCircle className="me-1" />
              {user?.name?.split(' ')[0]}
            </Dropdown.Toggle>
            
            <Dropdown.Menu>
              <Dropdown.Header>
                <div>{user?.name}</div>
                <div>
                  <small>
                    <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
                      {getRoleDisplay(user?.role)}
                    </span>
                  </small>
                </div>
              </Dropdown.Header>
              
              <Dropdown.Divider />
              
              <Dropdown.Item onClick={handleProfileClick}>
                <FaUserCircle className="me-2" />
                Profile
              </Dropdown.Item>
              
              <Dropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
