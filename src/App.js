import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

const API_URL = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';
const ROWS_PER_PAGE = 10;

const AdminPanel = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editRecordId, setEditRecordId] = useState(null);
  const [editedRecord, setEditedRecord] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const jsonData = await response.json();
      setData(jsonData);
      setFilteredData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = data.filter(
      (record) =>
        record.id.toLowerCase().includes(term.toLowerCase()) ||
        record.name.toLowerCase().includes(term.toLowerCase()) ||
        record.email.toLowerCase().includes(term.toLowerCase()) ||
        record.role.toLowerCase().includes(term.toLowerCase()) 
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowSelection = (id) => {
    const isSelected = selectedRows.includes(id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = () => {
    const currentPageData = filteredData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
    const allSelected = currentPageData.length === selectedRows.length;
    if (allSelected) {
      setSelectedRows([]);
    } else {
      const selectedIds = currentPageData.map((row) => row.id);
      setSelectedRows(selectedIds);
    }
  };

  const deleteSelectedRows = () => {
    const updatedData = data.filter((record) => !selectedRows.includes(record.id));
    setData(updatedData);
    setFilteredData(updatedData);
    setSelectedRows([]);
  };

  const handleEdit = (id) => {
    setEditRecordId(id);
    const recordToEdit = data.find((record) => record.id === id);
    setEditedRecord(recordToEdit);
  };

  const handleDelete = (id) => {
    const updatedData = data.filter((record) => record.id !== id);
    setData(updatedData);
    setFilteredData(updatedData);
    setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
  };

  const handleSaveEdit = (id) => {
    const updatedData = data.map((record) => {
      if (record.id === id) {
        return editedRecord;
      }
      return record;
    });

    setData(updatedData);
    setFilteredData(updatedData);
    setEditRecordId(null);
    setEditedRecord({});
  };

  const handleCancelEdit = () => {
    setEditRecordId(null);
    setEditedRecord({});
  };

  const handleEditInputChange = (e) => {
  const { name, value } = e.target;
  setEditedRecord((prevEditedRecord) => ({
    ...prevEditedRecord,
    [name]: value,
  }));
};


  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = filteredData.slice(startIndex, endIndex);

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* Search bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search" value={searchTerm} onChange={handleSearch} />
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={currentRows.length > 0 && currentRows.length === selectedRows.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((record) => (
            <tr key={record.id} className={selectedRows.includes(record.id) ? 'table-row--selected' : ''}>

              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(record.id)}
                  onChange={() => handleRowSelection(record.id)}
                />
              </td>
              <td>{record.id}</td>
              <td>
                {editRecordId === record.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editedRecord.name || ''}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  record.name
                )}
              </td>
              <td>
                {editRecordId === record.id ? (
                  <input
                    type="text"
                    name="email"
                    value={editedRecord.email || ''}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  record.email
                )}
              </td>
              <td>{record.role}</td>
              <td>
                {editRecordId === record.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(record.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(record.id)}>Edit</button>
                    <button onClick={() => handleDelete(record.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>
          First
        </button>
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
          Previous
        </button>
        {Array(Math.ceil(filteredData.length / ROWS_PER_PAGE))
          .fill()
          .map((_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? 'active' : ''}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        <button disabled={currentPage === Math.ceil(filteredData.length / ROWS_PER_PAGE)} onClick={() => handlePageChange(currentPage + 1)}>
          Next
        </button>
        <button
          disabled={currentPage === Math.ceil(filteredData.length / ROWS_PER_PAGE)}
          onClick={() => handlePageChange(Math.ceil(filteredData.length / ROWS_PER_PAGE))}
        >
          Last
        </button>
      </div>

      {/* Delete selected */}
      <div className="delete-selected">
        {selectedRows.length > 0 && (
          <button onClick={deleteSelectedRows}>Delete Selected ({selectedRows.length})</button>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
