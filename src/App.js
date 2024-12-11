import React from 'react';
import './App.css'; // Default styling if needed
import './SearchDnsLogs.css'; // Your custom CSS file
import SearchDNSLog from './SearchDnsLogs.js'; // Your custom JS file

function App() {
  return (
    <div className="App">
      <SearchDNSLog />  {/* This will render the content from your searchdnslog.js */}
    </div>
  );
}

export default App;
