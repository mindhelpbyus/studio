import React from 'react';

export interface VentureTableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface VentureTableProps {
  columns: VentureTableColumn[];
  data: Record<string, any>[];
  className?: string;
}

export const VentureTable = ({ columns, data, className = '' }: VentureTableProps) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-Color-Tokens-Border-Secondary">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-Color-Tokens-Content-Dark-Primary text-sm font-medium font-['Inter'] leading-tight"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-Color-Tokens-Border-Secondary hover:bg-Color-Tokens-Interaction-Secondary-Hover transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-Color-Tokens-Content-Dark-Primary text-sm font-normal font-['Inter'] leading-tight"
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface VentureDataTableProps {
  title: string;
  description?: string;
  columns: VentureTableColumn[];
  data: Record<string, any>[];
  actions?: React.ReactNode;
  className?: string;
}

export const VentureDataTable = ({
  title,
  description,
  columns,
  data,
  actions,
  className = '',
}: VentureDataTableProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-Color-Tokens-Border-Secondary">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-Color-Tokens-Content-Dark-Primary text-lg font-semibold font-['Inter']">
              {title}
            </h3>
            {description && (
              <p className="text-Color-Tokens-Content-Dark-Tertiary text-sm font-normal font-['Inter'] mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
      <VentureTable columns={columns} data={data} />
    </div>
  );
};
