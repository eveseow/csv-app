import axios from 'axios';

const API_BASE_URL = '/api/csv';

export interface CsvRecord {
  id: number;
  post_id: number;
  name: string;
  email: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetRecordsResponse {
  records: CsvRecord[];
  pagination: PaginationInfo;
}

export interface GetColumnsResponse {
  columns: string[];
}

export const csvApi = {
  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getRecords: async (page: number = 1, limit: number = 10, search: string = '') => {
    const response = await axios.get<GetRecordsResponse>(`${API_BASE_URL}/records`, {
      params: { page, limit, search },
    });
    return response.data;
  },

  getColumns: async () => {
    const response = await axios.get<GetColumnsResponse>(`${API_BASE_URL}/columns`);
    return response.data;
  },

  clearRecords: async () => {
    const response = await axios.delete(`${API_BASE_URL}/records`);
    return response.data;
  },
};