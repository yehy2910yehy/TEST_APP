using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using System;
using System.Net;

namespace SERVER
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
               .AddJsonFile("appsettings.json")
               .Build();
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(config)
                .CreateLogger();
            //BuildWebHost(args).Run();
            try
            {
                Log.Information("Server started");

                // Build(args).Run();

                BuildRelease(args).Run();
            }
            catch (Exception ex)
            {
            
            
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
     WebHost.CreateDefaultBuilder(args)
         .UseSerilog()
          .UseStartup<Startup>();

        public static IWebHost Build(string[] args) =>
         WebHost.CreateDefaultBuilder(args)
          .UseStartup<Startup>()
          .UseKestrel( x=>  x.Listen(IPAddress.Parse("192.168.1.101"), 5000))
         .Build();
        public static IWebHost BuildRelease(string[] args) =>
      WebHost.CreateDefaultBuilder(args)
          .UseSerilog()
       .UseStartup<Startup>()
           .Build();

    }
}
