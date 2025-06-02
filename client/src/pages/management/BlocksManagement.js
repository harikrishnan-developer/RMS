import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaDoorOpen, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BlockFormModal from '../../components/modals/BlockFormModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { fetchBlocks } from '../../redux/slices/blockSlice';

const BlocksManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [filteredBlocks, setFilteredBlocks] = useState([]);

  const dispatch = useDispatch();
  const { blocks = [], loading = false, error = null } = useSelector((state) => state.blocks || {});
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch blocks when the component mounts
    dispatch(fetchBlocks());
  }, [dispatch]);

  useEffect(() => {
    // Filter blocks based on search term
    if (blocks && Array.isArray(blocks)) {
      const filtered = blocks.filter(
        (block) =>
          (block.name && block.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (block.type && block.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (block.description && block.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (block.blockHead && block.blockHead.name && block.blockHead.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBlocks(filtered);
    }
  }, [blocks, searchTerm]);

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
      // When blockSlice is implemented, uncomment this
      // dispatch(deleteBlock(selectedBlock._id));
      console.log('Deleting block:', selectedBlock._id); // Temporary placeholder
      setShowDeleteModal(false);
    }
  };

  const getAvailabilityBadge = (available, total) => {
    const percentage = (available / total) * 100;
    
    if (percentage > 50) {
      return <Badge bg="success">{available}/{total}</Badge>;
    } else if (percentage > 20) {
      return <Badge bg="warning">{available}/{total}</Badge>;
    } else {
      return <Badge bg="danger">{available}/{total}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return <Alert variant="danger">{error.message || 'Error loading blocks'}</Alert>;
  }

  return (
    <Container fluid>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Blocks Management</h4>
            {user?.role === 'systemAdmin' && (
              <Button variant="primary" onClick={handleAddBlock}>
                <FaPlus className="me-1" /> Add Block
              </Button>
            )}
          </div>

          {error && <p className="text-danger">{error}</p>}

          <Row className="mb-3">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, type, or description"
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
                  <th>Type</th>
                  <th>Block Head</th>
                  <th>Rooms (Available/Total)</th>
                  <th>Beds (Available/Total)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks && filteredBlocks.length > 0 ? (
                  filteredBlocks.map((block) => (
                    <tr key={block._id}>
                      <td>{block.name}</td>
                      <td>{block.type}</td>
                      <td>{block.blockHead ? block.blockHead.name : 'Unassigned'}</td>
                      <td>{getAvailabilityBadge(block.availableRooms, block.totalRooms)}</td>
                      <td>{getAvailabilityBadge(block.availableBeds, block.totalBeds)}</td>
                      <td>
                        <Link to={`/management/rooms/${block._id}`} className="btn btn-outline-info btn-sm me-1">
                          <FaDoorOpen title="Manage Rooms" />
                        </Link>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditBlock(block)}
                        >
                          <FaEdit title="Edit Block" />
                        </Button>
                        {user?.role === 'systemAdmin' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(block)}
                          >
                            <FaTrash title="Delete Block" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
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
          onClose={() => setShowBlockModal(false)}
          data={{ block: selectedBlock }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Block"
          message={`Are you sure you want to delete ${selectedBlock?.name}? This will also delete all rooms and beds in this block. This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </Container>
  );
};

export default BlocksManagement;
