import React from "react";

function CustomDatagrid(props) {
  const { columns, rows } = props;
  const hrefUrl = "/details/";

  return (
    <>
      {rows && (
        <table class="table table-hover">
          <thead>
            <tr>
              {columns.map((col) => (
                <th>{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                {columns.map((col) => (
                  <td>{col.key === "order_id" ? <a href={hrefUrl + row.order_id}>{row[col.key]}</a> : row[col.key]}</td>
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
