const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4006;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sysmonLogs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// DNS Log Schema
const dnsLogSchema = new mongoose.Schema({
  logMessage: String,
  queryname: String,
  pid: Number,
  path: String,
  timestamp: Date,
  Ip: String,
});

dnsLogSchema.methods.parseLogMessage = function () {
  if (!this.logMessage) {
    console.error('Log shown successfully');
    return;
  }

  const logParts = this.logMessage.split('\n');
  if (logParts.length < 5) {
    console.error('Log message format is incorrect');
    return;
  }

  this.queryname = logParts[0].split(':')[1]?.trim();
  this.pid = parseInt(logParts[1].split(':')[1]?.trim()) || 0;
  this.path = logParts[2].split(':')[1]?.trim();
  this.timestamp = new Date(logParts[3].split(':')[1]?.trim());
  this.Ip = logParts[4].split(':')[1]?.trim();

  // Ensure timestamp is a valid Date
  if (isNaN(this.timestamp.getTime())) {
    console.error('Invalid timestamp:', logParts[3].split(':')[1]?.trim());
    this.timestamp = null; // Or handle the error appropriately
  }
};

const DnsLog = mongoose.model('dnsLogs', dnsLogSchema, 'dnsLogs'); // Specify collection name explicitly

// Helper function to format IP address for database query
const formatIpForQuery = (ip) => {
  const ipv4Pattern = /(\d{1,3}\.){3}\d{1,3}/;

  if (ipv4Pattern.test(ip)) {
    return ip;
  }
  return ip;
};

// Route to get DNS log by domain name
app.get('/api/dnslogs/domain/:domain', async (req, res) => {
  try {
    let domain = req.params.domain.trim();
    console.log(`Fetching logs for domain: ${domain}`);

    // Find logs based on queryname field
    const logs = await DnsLog.find({ queryname: domain });
    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for this domain');
      return res.status(404).json({ message: 'No logs found for this domain' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by process ID
app.get('/api/dnslogs/processid/:pid', async (req, res) => {
  try {
    let pid = parseInt(req.params.pid.trim(), 10);
    console.log(`Fetching logs for PID: ${pid}`);

    // Find logs based on pid field
    const logs = await DnsLog.find({ pid: pid });
    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for this PID');
      return res.status(404).json({ message: 'No logs found for this PID' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by IP
app.get('/api/dnslogs/ip/:ip', async (req, res) => {
  try {
    let ip = formatIpForQuery(req.params.ip.trim());
    console.log(`Fetching logs for IP: ${ip}`);

    // Find logs based on IP field
    const logs = await DnsLog.find({ Ip: new RegExp(ip) });
    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for this IP');
      return res.status(404).json({ message: 'No logs found for this IP' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by path
app.get('/api/dnslogs/path/:path', async (req, res) => {
  try {
    let path = req.params.path.trim();
    console.log(`Fetching logs for path: ${path}`);

    // Find logs based on path field
    const logs = await DnsLog.find({ path: path });
    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for this path');
      return res.status(404).json({ message: 'No logs found for this path' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by date
app.get('/api/dnslogs/date', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate in the format YYYY-MM-DD' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    end.setHours(23, 59, 59, 999); // Include the entire end date

    console.log(`Fetching logs between ${start.toISOString()} and ${end.toISOString()}`);

    // Find logs based on timestamp field
    const logs = await DnsLog.find({
      timestamp: {
        $gte: start,
        $lte: end,
      },
    });

    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for the provided date range');
      return res.status(404).json({ message: 'No logs found for the provided date range' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by time range (IST)
app.get('/api/dnslogs/time', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide both startTime and endTime in the format HH:MM:SS' });
    }

    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(part => parseInt(part, 10));
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(part => parseInt(part, 10));

    if (
      isNaN(startHours) || isNaN(startMinutes) || isNaN(startSeconds) ||
      isNaN(endHours) || isNaN(endMinutes) || isNaN(endSeconds)
    ) {
      return res.status(400).json({ message: 'Invalid time format. Please use HH:MM:SS.' });
    }

    // Convert IST time to UTC
    const istStartDate = new Date();
    istStartDate.setUTCHours(startHours - 5, startMinutes - 30, startSeconds, 0);
    const istEndDate = new Date();
    istEndDate.setUTCHours(endHours - 5, endMinutes - 30, endSeconds, 0);

    console.log(`Fetching logs for time between: ${istStartDate.toISOString()} and ${istEndDate.toISOString()}`);

    const logs = await DnsLog.find({
      timestamp: {
        $gte: istStartDate,
        $lt: istEndDate
      }
    });

    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for this time range');
      return res.status(404).json({ message: 'No logs found for this time range' });
    }

    logs.forEach(log => log.parseLogMessage());

    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

// Route to get DNS log by date and time range
app.get('/api/dnslogs/date-time', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide date, startTime, and endTime in the format YYYY-MM-DD and HH:MM:SS' });
    }

    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(part => parseInt(part, 10));
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(part => parseInt(part, 10));

    if (
      isNaN(startHours) || isNaN(startMinutes) || isNaN(startSeconds) ||
      isNaN(endHours) || isNaN(endMinutes) || isNaN(endSeconds)
    ) {
      return res.status(400).json({ message: 'Invalid time format. Please use HH:MM:SS.' });
    }

    // Construct start and end date objects for the given date
    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes, startSeconds, 0);

    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes, endSeconds, 999);

    console.log(`Fetching logs for date ${date} between ${startDate.toISOString()} and ${endDate.toISOString()}`);

    // Find logs based on timestamp field
    const logs = await DnsLog.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    console.log('Logs found:', logs);

    if (logs.length === 0) {
      console.log('No logs found for the provided date and time range');
      return res.status(404).json({ message: 'No logs found for the provided date and time range' });
    }

    // Parse log messages
    logs.forEach(log => log.parseLogMessage());

    // Format timestamps and include localIP for display
    const formattedLogs = logs.map(log => ({
      ...log.toObject(),
      formattedTimestamp: log.timestamp ? log.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Invalid Date'
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});