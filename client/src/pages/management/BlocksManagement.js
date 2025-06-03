import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BlockFormModal from '../../components/modals/BlockFormModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { deleteBlock, fetchBlocks } from '../../redux/slices/blockSlice';

const BlocksManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [filteredBlocks, setFilteredBlocks] = useState([]);

  const dispatch = useDispatch();
  const { blocks, loading, error } = useSelector((state) => state.blocks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBlocks());
  }, [dispatch]);

  useEffect(() => {
    if (blocks && Array.isArray(blocks)) {
      let filtered = blocks;
      
      // If user is a block head, only show their assigned block
      if (user?.role === 'blockHead' && user?.block) {
        filtered = blocks.filter(block => block._id === user.block._id);
      } else {
        // For other roles, filter based on search term
        filtered = blocks.filter(block => 
          block.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredBlocks(filtered);
    } else {
      setFilteredBlocks([]);
    }
  }, [blocks, searchTerm, user]);

  const handleAddBlock = () => {
    setSelectedBlock(null);
    setShowBlockModal(true);
  };

  const handleEditBlock = (block) => {
    setSelectedBlock(block);
    setShowBlockModal(true);
  };

  const handleDeleteClick = (block) => {
    setSelectedBlock(block);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedBlock) {
      dispatch(deleteBlock(selectedBlock._id));
      setShowDeleteModal(false);
    }
  };

  const handleModalClose = () => {
    setShowBlockModal(false);
    setSelectedBlock(null);
    // Refresh blocks list after any block operation
    dispatch(fetchBlocks());
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">Active</Badge>;
      case 'Under Maintenance':
        return <Badge bg="warning">Under Maintenance</Badge>;
      case 'Inactive':
        return <Badge bg="danger">Inactive</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return <Alert variant="danger">{error.message || 'Error loading blocks'}</Alert>;
  }

  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Blocks Management</h4>
            {user?.role === 'systemAdmin' && (
              <Button variant="primary" onClick={handleAddBlock}>
                <FaPlus className="me-1" /> Add Block
              </Button>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {user?.role !== 'blockHead' && (
            <Row className="mb-3">
              <Col>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, type, status, or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>
          )}

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Block Name</th>
                  <th>Type</th>
                  <th>Total Rooms</th>
                  <th>Available Rooms</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((block) => (
                  <tr key={block._id}>
                    <td>{block.name}</td>
                    <td>{block.type}</td>
                    <td>{block.totalRooms}</td>
                    <td>{block.availableRooms}</td>
                    <td>{getStatusBadge(block.status)}</td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {block.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/management/blocks/${block._id}/rooms`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Manage Rooms
                        </Link>
                        {user?.role === 'systemAdmin' && (
                          <>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleEditBlock(block)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(block)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBlocks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No blocks found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Block Form Modal */}
      {showBlockModal && (
        <BlockFormModal
          onClose={handleModalClose}
          data={{ block: selectedBlock }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Block"
          message={`Are you sure you want to delete Block ${selectedBlock?.name}? This action cannot be undone.`}
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

export default BlocksManagement;
