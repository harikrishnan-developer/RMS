import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import {
    FaBell,
    FaBook,
    FaBuilding,
    FaClipboardList,
    FaDoorOpen,
    FaHome,
    FaUserCircle,
    FaUsers
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  // Define navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      {
        path: '/dashboard',
        icon: <FaHome />,
        label: 'Dashboard',
      },
      {
        path: '/profile',
        icon: <FaUserCircle />,
        label: 'Profile',
      },
      {
        path: '/notifications',
        icon: <FaBell />,
        label: 'Notifications',
        badge: unreadCount > 0 ? unreadCount : null
      }
    ];

    // System Admin specific links
    const systemAdminLinks = [
      {
        path: '/management/users',
        icon: <FaUsers />,
        label: 'User Management',
      },
      {
        path: '/management/blocks',
        icon: <FaBuilding />,
        label: 'Block Management',
      },
      {
        path: '/management/requests',
        icon: <FaClipboardList />,
        label: 'Accommodation Requests',
      },
      {
        path: '/management/courses',
        icon: <FaBook />,
        label: 'Course Management',
      }
    ];

    // Admin specific links
    const adminLinks = [
      {
        path: '/management/blocks',
        icon: <FaBuilding />,
        label: 'Block Management',
      },
      {
        path: '/management/requests',
        icon: <FaClipboardList />,
        label: 'Accommodation Requests',
      }
    ];

    // Block Head specific links
    const blockHeadLinks = [
      // Removed accommodation requests link
    ];
    
    // Get assigned blocks for block head (if available)
    if (user && user.role === 'blockHead' && user.assignedBlocks && user.assignedBlocks.length > 0) {
      user.assignedBlocks.forEach(block => {
        blockHeadLinks.push({
          path: `/management/blocks/${block._id}/rooms`,
          icon: <FaDoorOpen />,
          label: `${block.name} Rooms`,
        });
      });
    }

    // Return appropriate links based on user role
    if (user) {
      if (user.role === 'systemAdmin') {
        return [...commonLinks, ...systemAdminLinks];
      } else if (user.role === 'admin') {
        return [...commonLinks, ...adminLinks];
      } else if (user.role === 'blockHead') {
        return [...commonLinks, ...blockHeadLinks];
      }
    }

    return commonLinks;
  };

  return (
    <div className={`sidebar-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
      <Navbar className="flex-column align-items-start h-100">
        <div className="d-flex justify-content-center align-items-center w-100 py-3">
          <Navbar.Brand className="text-white">
            {isOpen ? 'RFMS' : 'R'}
          </Navbar.Brand>
        </div>
        <Nav className="flex-column w-100">
          {getNavLinks().map((link) => (
            <Nav.Item key={link.path} className="w-100">
              <NavLink 
                to={link.path} 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <span className="icon me-2">{link.icon}</span>
                {isOpen && (
                  <span className="label">{link.label}</span>
                )}
                {link.badge && isOpen && (
                  <span className="notification-badge ms-auto">{link.badge}</span>
                )}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </Navbar>
    </div>
  );
};

export default Sidebar;
