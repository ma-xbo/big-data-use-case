import React from "react";
import classNames from "classnames";

function CustomModal(props) {
  const { title, isOpen } = props;

  return (
    <div
      className={classNames("modal", {
        show: isOpen,
      })}
      role="dialog"
      data-overlay-dismissal-disabled="true" 
      data-esc-dismissal-disabled="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <h5 className="modal-title">{title}</h5>
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default CustomModal;
