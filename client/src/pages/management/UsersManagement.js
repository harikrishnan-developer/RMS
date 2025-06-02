import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
// Import user actions from userSlice
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import UserFormModal from '../../components/modals/UserFormModal';
import { deleteUser, fetchUsers } from '../../redux/slices/userSlice';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    // Fetch users from the backend when component mounts
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    // Filter users based on search term
    if (users) {
      setFilteredUsers(
        users.filter(
          (user) =>
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [users, searchTerm]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser && selectedUser._id) {
      dispatch(deleteUser(selectedUser._id))
        .unwrap()
        .then(() => {
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
        });
    }
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    handleDeleteUser();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'systemAdmin':
        return <Badge bg="danger">System Admin</Badge>;
      case 'admin':
        return <Badge bg="warning">Admin</Badge>;
      case 'blockHead':
        return <Badge bg="info">Block Head</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Users Management</h4>
            <Button variant="primary" onClick={handleAddUser}>
              <FaPlus className="me-1" /> Add User
            </Button>
          </div>

          {error && <p className="text-danger">{error}</p>}

          <Row className="mb-3">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email, or role"
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Blocks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        {user.assignedBlocks && user.assignedBlocks.length > 0
                          ? user.assignedBlocks.map(block => block.name).join(', ')
                          : 'None'}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* User Form Modal */}
      {showUserModal && (
        <UserFormModal
          onClose={() => setShowUserModal(false)}
          data={{ user: selectedUser }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
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

export default UsersManagement;
