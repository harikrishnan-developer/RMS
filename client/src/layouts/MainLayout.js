import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../redux/slices/uiSlice';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModalManager from '../components/common/ModalManager';

const MainLayout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'col-md-3 col-lg-2' : 'col-md-1'}`}>
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'col-md-9 col-lg-10' : 'col-md-11'}`}>
        <Header onToggleSidebar={handleToggleSidebar} />
        <Container fluid className="py-4">
          <Row>
            <Col>
              {loading && <LoadingSpinner />}
              <Outlet />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal Manager */}
      <ModalManager />
    </div>
  );
};

export default MainLayout;
