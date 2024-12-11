import React, { useState } from 'react';
import axios from 'axios';
import './SearchDnsLogs.css';

function SearchDnsLogs() {
  const [domain, setDomain] = useState('');
  const [pid, setPid] = useState('');
  const [ip, setIp] = useState('');
  const [path, setPath] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [logs, setLogs] = useState([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const PORT = 4006;

  const handleSearch = async () => {
    setSearchAttempted(true); // Mark that a search has been attempted

    try {
      let response;
      if (domain) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/domain/${encodeURIComponent(domain)}`);
      } else if (pid) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/processid/${pid}`);
      } else if (ip) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/ip/${encodeURIComponent(ip)}`);
      } else if (path) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/path/${encodeURIComponent(path)}`);
      } else if (startDate && endDate) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/date?startDate=${startDate}&endDate=${endDate}`);
      } else if (date && startTime && endTime) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/date-time?date=${date}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
      } else if (startTime && endTime) {
        response = await axios.get(`http://localhost:${PORT}/api/dnslogs/time?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
      } else {
        return alert('Please enter a domain name, PID, IP, path, date range, or time range to search.');
      }

      if (response.data.length === 0) {
        setLogs([]);
        // Display message on UI
        alert('No logs found for this query.');
      } else {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching DNS logs:', error);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : i;
      times.push(`${hour}:00:00`);
    }
    return times;
  };

  return (
    <div className="container">
      <header>
        <h1>DNS Log Explorer</h1>
      </header>
      <main>
        <div className="search-container">
          <div className="top-row">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter Domain name..."
            />
            <input
              type="text"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              placeholder="Enter Process ID..."
            />
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter IP address..."
            />
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Enter Path..."
            />
          </div>
          <div className="middle-row">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Enter start date..."
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Enter end date..."
            />
          </div>
          <div className="bottom-row">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Enter date..."
            />
            <div className="time-dropdown">
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                <option value="">Select Start Time</option>
                {generateTimeOptions().map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                <option value="">Select End Time</option>
                {generateTimeOptions().map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="table-container">
          {searchAttempted && logs.length === 0 && (
            <p>No logs found for this query.</p>
          )}
          {logs.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Query Name</th>
                  <th>PID</th>
                  <th>Path</th>
                  <th>Timestamp</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.queryname}</td>
                    <td>{log.pid}</td>
                    <td>{log.path}</td>
                    <td>{log.formattedTimestamp}</td>
                    <td>{log.Ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchDnsLogs;