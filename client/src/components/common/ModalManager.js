import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../../redux/slices/uiSlice';

// Import modals
import UserFormModal from '../modals/UserFormModal';
import BlockFormModal from '../modals/BlockFormModal';
import RoomFormModal from '../modals/RoomFormModal';
import BedFormModal from '../modals/BedFormModal';
import RequestFormModal from '../modals/RequestFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';

const ModalManager = () => {
  const { currentModal, modalData } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  // Render the appropriate modal based on currentModal value
  const renderModal = () => {
    switch (currentModal) {
      case 'USER_FORM':
        return <UserFormModal onClose={handleClose} data={modalData} />;
      case 'BLOCK_FORM':
        return <BlockFormModal onClose={handleClose} data={modalData} />;
      case 'ROOM_FORM':
        return <RoomFormModal onClose={handleClose} data={modalData} />;
      case 'BED_FORM':
        return <BedFormModal onClose={handleClose} data={modalData} />;
      case 'REQUEST_FORM':
        return <RequestFormModal onClose={handleClose} data={modalData} />;
      case 'CONFIRMATION':
        return <ConfirmationModal onClose={handleClose} data={modalData} />;
      default:
        return null;
    }
  };

  if (!currentModal) {
    return null;
  }

  return renderModal();
};

export default ModalManager;
