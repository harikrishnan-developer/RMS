import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { FaBed, FaDoorOpen, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RequestFormModal from '../../components/modals/RequestFormModal';
import { fetchBlockHeadStats } from '../../redux/slices/statsSlice';

const BlockHeadDashboard = () => {
  const dispatch = useDispatch();
  const { blockHeadStats: stats, loading, error } = useSelector((state) => state.stats);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    dispatch(fetchBlockHeadStats());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Block Head Dashboard</h4>
              <p className="text-muted">
                Welcome to your block management dashboard. Here you can manage rooms, beds, and handle accommodation requests.
              </p>
              <div className="mt-3">
                <Button variant="primary" size="sm" onClick={() => setShowRequestModal(true)}>
                  <FaPlus className="me-1" /> Create New Request
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Form Modal */}
      {showRequestModal && (
        <RequestFormModal
          show={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          data={null}
        />
      )}

      <Row className="mb-4">
        {/* Rooms Summary Card */}
        <Col lg={6} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-primary text-white p-3 rounded me-3">
                  <FaDoorOpen size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Rooms</h5>
                </div>
              </div>
              <Card.Text>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Rooms:</span>
                  <Badge bg="info">{stats?.totalRooms || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Available:</span>
                  <Badge bg="success">{stats?.availableRooms || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Occupied:</span>
                  <Badge bg="danger">{stats?.totalRooms - stats?.availableRooms || 0}</Badge>
                </div>
              </Card.Text>
              <div className="mt-auto pt-2">
                <Button as={Link} to="/management/rooms" variant="outline-primary" size="sm">
                  Manage Rooms
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Beds Summary Card */}
        <Col lg={6} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-success text-white p-3 rounded me-3">
                  <FaBed size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Beds</h5>
                </div>
              </div>
              <Card.Text>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Beds:</span>
                  <Badge bg="info">{stats?.totalBeds || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Available:</span>
                  <Badge bg="success">{stats?.availableBeds || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Occupied:</span>
                  <Badge bg="danger">{stats?.totalBeds - stats?.availableBeds || 0}</Badge>
                </div>
              </Card.Text>
              <div className="mt-auto pt-2">
                <Button as={Link} to="/management/rooms" variant="outline-success" size="sm">
                  Manage Beds
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Block Status</h5>
            </Card.Header>
            <Card.Body>
              {error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Block Name</th>
                        <th>Total Rooms</th>
                        <th>Available Rooms</th>
                        <th>Total Beds</th>
                        <th>Available Beds</th>
                        <th>Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{stats?.blocks?.join(', ') || 'No blocks assigned'}</td>
                        <td>{stats?.totalRooms || 0}</td>
                        <td>{stats?.availableRooms || 0}</td>
                        <td>{stats?.totalBeds || 0}</td>
                        <td>{stats?.availableBeds || 0}</td>
                        <td>
                          <div className="progress" style={{ height: '10px' }}>
                            <div 
                              className={`progress-bar ${stats?.occupancyRate >= 90 ? 'bg-danger' : stats?.occupancyRate >= 70 ? 'bg-warning' : 'bg-success'}`}
                              role="progressbar"
                              style={{ width: `${stats?.occupancyRate || 0}%` }}
                              aria-valuenow={stats?.occupancyRate || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small>{(stats?.occupancyRate || 0).toFixed(0)}%</small>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlockHeadDashboard;
