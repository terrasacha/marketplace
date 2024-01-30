import React, { ReactNode, useState } from 'react';

interface ModalHeaderProps {
  sep?: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClose: () => void;
}

class ModalHeader extends React.Component<ModalHeaderProps> {
  render() {
    const {
      sep = false,
      children,
      onClose,
    } = this.props;
    return (
      <>
        {/* <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="mb-0 text-2xl font-semibold">{title}</p>
              <p className="mb-0 text-sm">{subtitle}</p>
            </div>
            <div>{tooltip}</div>
          </div>
        </div> */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {children}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
      </>
    );
  }
}

interface ModalBodyProps {
  className?: string;
  children?: ReactNode;
}

class ModalBody extends React.Component<ModalBodyProps> {
  render() {
    const { className = '', children } = this.props;
    return <div className={`p-4 md:p-5 space-y-4 ${className}`}>{children}</div>
  }
}

interface ModalFooterProps {
  sep?: boolean;
  className?: string;
  children?: ReactNode;
}

class ModalFooter extends React.Component<ModalFooterProps> {
  render() {
    const { sep = false, children, className = '' } = this.props;
    return (
      <>
        <div className={`flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b ${className}`}>
          {children}
        </div>
      </>
    );
  }
}

interface ModalProps {
  show?: boolean;
  size?: string;
  position?: string;
  className?: string;
  children?: ReactNode;
}

class Modal extends React.Component<ModalProps> {
  static Header = ModalHeader;
  static Body = ModalBody;
  static Footer = ModalFooter;

  render() {
    const {
      className = '',
      children,
      show,
      size = 'md',
      position,
    } = this.props;

    return (
      <>
        {/* Main modal */}
        <div
          tabIndex={-1}
          aria-hidden="true"
          className={`${
            !show && 'hidden'
          } flex overflow-y-hidden overflow-x-hidden fixed top-0 right-0 left-0 z-50 px-10 justify-center items-center w-full md:inset-0 h-full max-h-full bg-gray-900 bg-opacity-50 no-scrollbar ${className}`}
        >
          <div className={`relative w-full max-w-${size} max-h-full`}>
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Modal;
