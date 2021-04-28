import React from "react";

function ViewContainer(props) {
  return (
    <div className="content">
      {props.title && <h2 className="content-title">{props.title}</h2>}
      {props.children}
    </div>
  );
}

export default ViewContainer;
