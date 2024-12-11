# Host_Dns_Visualisation_And_Collection_System
A DNS Monitoring and Analysis System designed to enhance cybersecurity by capturing DNS queries using Sysmon, processing them with C# agents, storing them in MongoDB, and providing a React.js web interface for querying and visualization.
Here’s the complete README file in a single set for easy copying:  


# DNS Monitoring and Analysis System  

A comprehensive system to monitor, analyze, and visualize DNS traffic for enhanced cybersecurity. This project captures DNS queries at the endpoint level, stores them in a centralized database, and provides an intuitive web interface for querying and analyzing the data.  

## Features  
- **Real-time DNS Monitoring**: Captures DNS queries along with process details using Sysmon.  
- **Secure Log Transmission**: Implements socket programming for secure client-server communication.  
- **Centralized Storage**: Stores extracted DNS logs in a MongoDB database with key details such as query name, timestamp, process ID, path, and IP address.  
- **Web Interface**: Provides a React.js-based frontend with search functionality for efficient log querying and visualization.  
- **Scalability**: Designed to handle large-scale log data and support future enhancements.  

## Technology Stack  
- **Monitoring**: Sysmon  
- **Backend Development**: C#, Node.js, Express.js  
- **Frontend Development**: React.js  
- **Database**: MongoDB  
- **Networking**: Socket Programming  

## Installation  
### Prerequisites  
- Install [Sysmon](https://docs.microsoft.com/en-us/sysinternals/downloads/sysmon).  
- Node.js and npm installed on your system.  
- MongoDB installed or hosted.  


   
1. Set up the backend:  
   - Navigate to the `backend` folder.  
   - Install dependencies:  
     
     npm install
       
   - Configure MongoDB connection in the `.env` file.  
   - Start the backend server:  
     ```bash
     npm start
     ```  
2. Set up the frontend:  
   - Navigate to the `frontend` folder.  
   - Install dependencies:  
     
     npm install
       
   - Start the frontend server:  

     npm start
     

3. Deploy the C# agent:  
   - Compile and run the C# agent to start capturing logs from Sysmon and transmitting them to the backend.  

## Usage  
- Access the web interface at `http://localhost:3000`.  
- Use the search fields to query DNS logs by query name, process ID, timestamp range, etc.  

## Challenges  
- Formatting timestamps from Sysmon's default UTC to a user-friendly format.  
- Addressing compatibility issues with BSON timestamps in MongoDB.  
- Extracting and processing IP addresses accurately.  

## Future Scope  
- Integrate machine learning for anomaly detection.  
- Add real-time alerting for suspicious DNS activity.  
- Expand the system to support distributed deployments across multiple endpoints.  

## Contributing  
Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.  

## License  
This project is licensed under the [MIT License](LICENSE).  

## Contact  
For any queries or feedback, feel free to contact:  
- **Bineet Roy**: [bineetroy7@gmail.com](mailto:bineetroy7@gmail.com)  
```
