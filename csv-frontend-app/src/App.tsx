import React, { useState, useEffect } from "react";
import { csvApi, CsvRecord, PaginationInfo } from "./api";
import "./App.css";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [records, setRecords] = useState<CsvRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadRecords();
    loadColumns();
  }, [pagination.page, pagination.limit, search]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await csvApi.getRecords(
        pagination.page,
        pagination.limit,
        search,
      );
      setRecords(data.records);
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      console.error("Error loading records:", err);
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const loadColumns = async () => {
    try {
      const data = await csvApi.getColumns();
      setColumns(data.columns);
    } catch (err) {
      console.error("Error loading columns:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await csvApi.uploadCsv(file);
      setUploadSuccess(true);
      setFile(null);
      setPagination({ ...pagination, page: 1 });
      await loadRecords();
      await loadColumns();

      // Reset file input
      const fileInput = document.getElementById(
        "file-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Failed to upload CSV");
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 });
  };

  const handleClearRecords = async () => {
    if (window.confirm("Are you sure you want to clear all records?")) {
      try {
        setLoading(true);
        await csvApi.clearRecords();
        await loadRecords();
        await loadColumns();
        setError("");
      } catch (err) {
        console.error("Error clearing records:", err);
        setError("Failed to clear records");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>CSV Upload & Filter</h1>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn btn-primary"
            >
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
          {file && <p className="file-name">Selected: {file.name}</p>}
          {uploadSuccess && (
            <p className="success-message">CSV uploaded successfully!</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Search and Controls */}
        <div className="controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <div className="control-group">
            <label>
              Rows per page:
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="limit-select"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <button
              onClick={handleClearRecords}
              className="btn btn-danger"
              disabled={loading || records.length === 0}
            >
              Clear All Records
            </button>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : records.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {columns.map((column) => (
                      <th key={column}>{column.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.post_id}</td>
                      <td>{record.name}</td>
                      <td>{record.email}</td>
                      <td className="body-cell">{record.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} records
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            {search
              ? "No records found matching your search."
              : "No records. Upload a CSV file to get started."}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
