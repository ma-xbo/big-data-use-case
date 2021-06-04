import React from "react";

function CustomPagination(props) {
  const { currentPage, maxPage, nextPage, prevPage } = props;

  return (
    <ul className="pagination d-flex justify-content-center my-15">
      {currentPage > 1 ? (
        <li className="page-item">
          <button className="page-link" onClick={() => prevPage(currentPage - 1)}>
            Vorherige Seite
          </button>
        </li>
      ) : (
        <li className="page-item disabled">
          <button className="page-link">Vorherige Seite</button>
        </li>
      )}
      <li className="page-item active">
        <p className="page-link">{currentPage}</p>
      </li>
      {currentPage === maxPage ? (
        <li className="page-item disabled">
          <button className="page-link" onClick={() => nextPage(currentPage + 1)}>
            Nächste Seite
          </button>
        </li>
      ) : (
        <li className="page-item">
          <button className="page-link" onClick={() => nextPage(currentPage + 1)}>
            Nächste Seite
          </button>
        </li>
      )}
    </ul>
  );
}

export default CustomPagination;
