// Database helper utilities for MySQL

export const getFirstRow = (result: any): any => {
  return result[0]?.[0] || null;
};

export const getAllRows = (result: any): any[] => {
  return result[0] || [];
};

export const getAffectedRows = (result: any): number => {
  return result[0]?.affectedRows || 0;
};


