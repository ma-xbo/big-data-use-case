import React from "react";

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
                    {col.key === linkKey ? <a href={hrefUrl + row.order_id}>{row[col.key]}</a> : row[col.key]}
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
