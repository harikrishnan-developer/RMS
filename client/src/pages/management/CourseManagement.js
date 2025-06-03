import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CourseFormModal from '../../components/modals/CourseFormModal';
import { getCourses, resetCourseState } from '../../redux/slices/courseSlice';

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(getCourses());
    return () => {
      dispatch(resetCourseState());
    };
  }, [dispatch]);

  const handleAddCourse = () => {
    setShowCourseModal(true);
  };

  const handleModalClose = () => {
    setShowCourseModal(false);
    // Optionally refresh the list after adding/editing
    dispatch(getCourses());
  };

  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.coordinatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.duration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Course Management</h4>
            <Button variant="primary" onClick={handleAddCourse}>
              <FaPlus className="me-1" /> Add Course
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by course name, coordinator, or duration"
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
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Coordinator Name</th>
                  <th>Created By</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseName}</td>
                    <td>{course.duration}</td>
                    <td>{new Date(course.date).toLocaleDateString()}</td>
                    <td>{course.coordinatorName}</td>
                    <td>{course.createdBy?.name || 'N/A'}</td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Course Form Modal */}
      <CourseFormModal 
        show={showCourseModal} 
        onClose={handleModalClose} 
      />
    </Container>
  );
};

export default CourseManagement; 