// Database helper utilities for MySQL

const extractRows = (result: any): any[] => {
  if (Array.isArray(result)) {
    // Shape: [rows, fields]
    if (Array.isArray(result[0])) {
      return result[0] || [];
    }
    // Already rows array (because caller destructured)
    return result;
  }
  return [];
};

export const getFirstRow = (result: any): any => {
  const rows = extractRows(result);
  return rows[0] || null;
};

export const getAllRows = (result: any): any[] => {
  return extractRows(result);
};

export const getAffectedRows = (result: any): number => {
  return result[0]?.affectedRows || 0;
};


