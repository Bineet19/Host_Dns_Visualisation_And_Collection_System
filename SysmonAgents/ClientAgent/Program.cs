using System;
using System.Diagnostics.Eventing.Reader;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

class SysmonLogReader
{
    private static DateTime? lastReadTime = null;
    private static readonly string serverIp = "192.168.1.39";  // Server IP address
    private static readonly int serverPort = 5003;  // Server port

    static void Main()
    {
        // Get local machine IP addresses
        IPAddress[] localIpAddresses = Dns.GetHostEntry(Dns.GetHostName()).AddressList;
        string Ip = string.Join(", ", Array.ConvertAll(localIpAddresses, ip => ip.ToString())); // Convert IP addresses to string

        // Print out local IP addresses for debugging
        Console.WriteLine($"Local IP addresses: {Ip}");

        // Specify the path to the Sysmon log file
        string sysmonLogPath = @"C:\Windows\System32\winevt\Logs\Microsoft-Windows-Sysmon%4Operational.evtx";

        // Print out the path for debugging
        Console.WriteLine($"Sysmon log path: {sysmonLogPath}");

        // Create a new EventLogQuery to query the Sysmon log for DNS events
        EventLogQuery query = new EventLogQuery("Microsoft-Windows-Sysmon/Operational", PathType.LogName,
            "*[System/EventID=22]");

        // Set up a timer to capture DNS events every minute
        Timer timer = new Timer(CaptureDNSLogs, Ip, TimeSpan.Zero, TimeSpan.FromMinutes(1));
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
        timer.Dispose();
    }

    static async void CaptureDNSLogs(object? state)
    {
        string localIp = state as string; // Retrieve localIp from state

        try
        {
            // Cast the state object back to an EventLogQuery
            EventLogQuery query = new EventLogQuery("Microsoft-Windows-Sysmon/Operational", PathType.LogName,
                "*[System/EventID=22]");

            // Create an EventLogReader to read events matching the query
            using (EventLogReader reader = new EventLogReader(query))
            {
                // Read and display each DNS event
                for (EventRecord? eventInstance = reader.ReadEvent(); eventInstance != null; eventInstance = reader.ReadEvent())
                {
                    // Extract relevant information from the event
                    string? processName = eventInstance.Properties[4]?.Value?.ToString();
                    int.TryParse(eventInstance.Properties[3]?.Value?.ToString(), out int processId);
                    DateTime timestamp = eventInstance.TimeCreated ?? DateTime.MinValue;
                    string? queryText = eventInstance.Properties[7]?.Value?.ToString();

                    // Skip events that are older than the last read event
                    if (lastReadTime.HasValue && timestamp <= lastReadTime.Value)
                    {
                        continue;
                    }

                    // Update the last read time 
                    lastReadTime = timestamp;

                    // Format the log line
                    string logLine = $"queryname:{processName}\npid:{processId}\npath:{queryText}\ntimestamp:{timestamp:yyyy-MM-dd HH:mm:ss}\nIp:{localIp}";

                    // Send the log line to the server
                    await SendLogToServer(logLine);

                    // Print the log line to the console
                    Console.WriteLine(logLine);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred: {ex.Message}");
        }
    }

    static async Task SendLogToServer(string log)
    {
        try
        {
            using (TcpClient client = new TcpClient())
            {
                // Connect to the server
                await client.ConnectAsync(serverIp, serverPort);
                using (NetworkStream stream = client.GetStream())
                {
                    // Convert the log line to a byte array
                    byte[] data = Encoding.UTF8.GetBytes(log);

                    // Send the byte array to the server
                    await stream.WriteAsync(data, 0, data.Length);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send log to server: {ex.Message}");
        }
    }
}