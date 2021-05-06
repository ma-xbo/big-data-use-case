import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function CustomDatagrid(props) {
  const { columns, rows, linkKey } = props;
  const hrefUrl = "/details/";

  return (
    <>
      {rows && (
        <table className="table table-hover">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.order_id}>
                {columns.map((col) => (
                  <td key={col.key + "_" + row.order_id}>
                    {col.key === linkKey ? <Link to={hrefUrl + row.order_id}>{row[col.key]}</Link> : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!rows && <div>Keine Daten vorhanden</div>}
    </>
  );
}

export default CustomDatagrid;
