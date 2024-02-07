import React, { ReactNode, ReactElement } from "react";

interface CardHeaderProps {
  sep?: boolean;
  title?: string;
  subtitle?: string;
  tooltip?: ReactNode;
}

class CardHeader extends React.Component<CardHeaderProps> {
  render() {
    const { sep = false, title = "", subtitle = "", tooltip = "" } = this.props;
    return (
      <>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="mb-0 text-2xl font-semibold">{title}</p>
              <p className="mb-0 text-sm">{subtitle}</p>
            </div>
            <div>{tooltip}</div>
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
    const { className = "", children } = this.props;
    return (
      <div className={className + " px-6 pb-6"}>
        {children}
      </div>
    );
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
  children?: ReactNode;
}

class Card extends React.Component<CardProps> {
  static Header = CardHeader;
  static Body = CardBody;
  static Footer = CardFooter;

  render() {
    const { className = "", children } = this.props;
    return (
      <div className={className + " border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-[#e7ebf5]"}>
        {children}
      </div>
    );
  }
}

export default Card;
