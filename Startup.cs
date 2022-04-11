using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SERVER.SETTINGS;
using System;
using Westwind.AspNetCore.LiveReload;
namespace SERVER
{
    public partial class Startup
    {
        public IConfigurationRoot config { get; }
        public IWebHostEnvironment environement { get; }
        public Startup(IWebHostEnvironment env)
        {
            environement = env;
        }
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<IISOptions>(options => { options.ForwardClientCertificate = false; });
            services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IServerOptions, ServerOptions>();
            services.AddSingleton<IRouteService, RouteService>();
            services.AddControllers(option => option.EnableEndpointRouting = false).AddNewtonsoftJson();
            services.Configure<IISServerOptions>(opt => { opt.MaxRequestBodySize = int.MaxValue; });
            services.Configure<KestrelServerOptions>(opt => { opt.Limits.MaxRequestBodySize = int.MaxValue; });
            services.Configure<FormOptions>(x =>
            {
                x.MultipartHeadersLengthLimit = Int32.MaxValue;
                x.MultipartBoundaryLengthLimit = Int32.MaxValue;
                x.MultipartBodyLengthLimit = Int64.MaxValue;
                x.ValueLengthLimit = Int32.MaxValue;
                x.BufferBodyLengthLimit = Int64.MaxValue;
                x.MemoryBufferThreshold = Int32.MaxValue;
            });
            // set FR
            services.Configure<RequestLocalizationOptions>(opt =>
            {
                opt.DefaultRequestCulture =
                new Microsoft.AspNetCore.Localization.RequestCulture("fr-FR");
            });
            services.AddSignalR();
            services.AddLiveReload();
        }
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider serviceProvider)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }
            if (env.IsDevelopment())
                app.UseLiveReload();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            //app.UseCookiePolicy();
            app.UseRouting();
            app.UseCors(x =>
            {
                x.AllowAnyOrigin(); // set only same server
                x.AllowAnyHeader();
                x.AllowAnyMethod();
                x.WithExposedHeaders("Content-Disposition");
            });
            app.UseEndpoints(endPoints =>
            {
                endPoints.MapControllers();
            });
        }
    }
}
