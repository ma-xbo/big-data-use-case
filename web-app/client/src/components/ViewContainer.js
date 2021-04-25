import React from "react";

function ViewContainer(props) {
  return (
    <div class="content">
      {props.title && <h2 class="content-title">{props.title}</h2>}
      {props.children}
    </div>
  );
}

export default ViewContainer;
