import React from 'react';
import { InstamojoModal, InstamojoModalProps } from './InstamojoModal';

export type RazorpayModalProps = InstamojoModalProps;

// Backwards-compatible alias for existing imports
export const RazorpayModal: React.FC<InstamojoModalProps> = (props) => {
  return <InstamojoModal {...props} />;
};

export { InstamojoModal };
