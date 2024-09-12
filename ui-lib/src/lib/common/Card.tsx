import React, { ReactNode, ReactElement } from 'react';

interface CardHeaderProps {
  sep?: boolean;
  title?: string;
  subtitle?: string;
  tooltip?: ReactNode;
  className?: string;
}

class CardHeader extends React.Component<CardHeaderProps> {
  render() {
    const {
      sep = false,
      title = '',
      subtitle = '',
      tooltip = '',
      className = '',
    } = this.props;
    return (
      <>
        <div className={`${className} pt-6 px-6`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="mb-0 text-2xl font-semibold">{title}</p>
              <p className="mb-0 text-sm">{subtitle}</p>
            </div>
            {tooltip && <div>{tooltip}</div>}
          </div>
        </div>
        {sep && <hr className="m-0 border-1" />}
      </>
    );
  }
}

interface CardBodyProps {
  className?: string;
  children?: ReactNode;
}

class CardBody extends React.Component<CardBodyProps> {
  render() {
    const { className = '', children } = this.props;
    return <div className={className + ' p-6'}>{children}</div>;
  }
}

interface CardFooterProps {
  sep?: boolean;
  children?: ReactNode;
}

class CardFooter extends React.Component<CardFooterProps> {
  render() {
    const { sep = false, children } = this.props;
    return (
      <>
        {sep && <hr className="m-0" />}
        <footer className="py-3 px-4">{children}</footer>
      </>
    );
  }
}

interface CardProps {
  className?: string;
  bgColor?: string;
  children?: ReactNode;
}

class Card extends React.Component<CardProps> {
  static Header = CardHeader;
  static Body = CardBody;
  static Footer = CardFooter;

  render() {
    const {
      className = '',
      children,
      bgColor = 'bg-custom-fondo',
    } = this.props;
    return (
      <div
        className={`border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 ${bgColor} animate-fade animate-ease-in animate-duration-300 ${className}`}
      >
        {children}
      </div>
    );
  }
}

export default Card;
