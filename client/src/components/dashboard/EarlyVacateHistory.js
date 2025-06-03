import React, { useEffect, useState } from 'react';
import { Card, Form, InputGroup, Table } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarlyVacateHistory } from '../../redux/slices/bedSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const EarlyVacateHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const dispatch = useDispatch();
  const { earlyVacateHistory, loading, error } = useSelector((state) => state.beds);

  useEffect(() => {
    console.log('Fetching early vacate history...');
    dispatch(fetchEarlyVacateHistory());
  }, [dispatch]);

  useEffect(() => {
    console.log('Early vacate history updated:', earlyVacateHistory);
    if (earlyVacateHistory && Array.isArray(earlyVacateHistory)) {
      const filtered = earlyVacateHistory.filter(record => 
        record.occupantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.blockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.roomNumber?.toString().includes(searchTerm) ||
        record.bedNumber?.toString().includes(searchTerm)
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory([]);
    }
  }, [searchTerm, earlyVacateHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Early Vacate Records</h5>
          <InputGroup style={{ width: '300px' }}>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, reason, block, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Occupant Name</th>
                <th>Location</th>
                <th>Original Check-out</th>
                <th>Early Vacate Date</th>
                <th>Reason</th>
                <th>Contact Person</th>
                <th>Contact Number</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory && filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record._id}>
                    <td>{record.occupantName || 'N/A'}</td>
                    <td>
                      Block {record.blockName || 'N/A'}
                      <br />
                      <small className="text-muted">
                        Room {record.roomNumber || 'N/A'}, Bed {record.bedNumber || 'N/A'}
                      </small>
                    </td>
                    <td>{formatDate(record.originalCheckOutDate)}</td>
                    <td>{formatDate(record.vacateDate)}</td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {record.reason || 'N/A'}
                      </div>
                    </td>
                    <td>{record.contactName || 'N/A'}</td>
                    <td>{record.contactNumber || 'N/A'}</td>
                    <td>
                      {record.notes && (
                        <div style={{ maxWidth: '200px' }}>
                          <small className="text-muted">{record.notes}</small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No early vacate records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EarlyVacateHistory; 