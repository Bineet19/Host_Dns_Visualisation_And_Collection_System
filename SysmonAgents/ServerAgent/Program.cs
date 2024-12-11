using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using MongoDB.Bson;
using MongoDB.Driver;

class Server
{
    private static readonly int serverPort = 5003;
    private static TcpListener server;
    private static IMongoCollection<BsonDocument> logCollection;

    static void Main(string[] args)
    {
        InitializeMongoDB();

        server = new TcpListener(IPAddress.Any, serverPort);
        server.Start();
        Console.WriteLine($"Server listening on port {serverPort}...");

        try
        {
            while (true)
            {
                TcpClient client = server.AcceptTcpClient();
                Console.WriteLine("Client connected!");

                HandleClient(client);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception occurred: {ex.Message}");
        }
        finally
        {
            server.Stop();
        }
    }

    static void InitializeMongoDB()
    {
        var client = new MongoClient("mongodb://localhost:27017");
        var database = client.GetDatabase("sysmonLogs");
        logCollection = database.GetCollection<BsonDocument>("dnsLogs");

        Console.WriteLine("Connected to MongoDB");
    }

    static void HandleClient(TcpClient client)
    {
        try
        {
            using (NetworkStream stream = client.GetStream())
            {
                byte[] buffer = new byte[1024];
                StringBuilder dataBuilder = new StringBuilder();

                while (true)
                {
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead == 0)
                    {
                        break;
                    }

                    string dataReceived = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    dataBuilder.Append(dataReceived);

                    // Log received data to MongoDB
                    LogToMongoDB(dataReceived);

                    Array.Clear(buffer, 0, buffer.Length);
                }

                string allData = dataBuilder.ToString();
                Console.WriteLine($"All Received Data: {allData}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception occurred: {ex.Message}");
        }
        finally
        {
            Console.WriteLine("Client disconnected.");
        }
    }

    static void LogToMongoDB(string logMessage)
    {
        try
        {
            var logParts = logMessage.Split('\n');

            if (logParts.Length < 5)
            {
                throw new Exception("Log message format is invalid.");
            }

            var logDocument = new BsonDocument
            {
                { "queryname", logParts[0].Split(new[] { ':' }, 2)[1].Trim() },
                { "pid", int.Parse(logParts[1].Split(new[] { ':' }, 2)[1].Trim()) },
                { "path", logParts[2].Split(new[] { ':' }, 2)[1].Trim() },
                { "timestamp", DateTime.ParseExact(logParts[3].Split(new[] { ':' }, 2)[1].Trim(), "yyyy-MM-dd HH:mm:ss", null) },
                { "Ip", logParts[4].Split(new[] { ':' }, 2)[1].Trim() }
            };

            logCollection.InsertOne(logDocument);

            Console.WriteLine("Log stored in MongoDB");
        }
        catch (FormatException ex)
        {
            Console.WriteLine($"Failed to parse date/time: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to write to MongoDB: {ex.Message}");
        }
    }
}