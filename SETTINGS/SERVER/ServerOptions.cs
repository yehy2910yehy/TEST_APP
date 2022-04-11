using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using MODELS;
using System;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace SERVER.SETTINGS
{
  


    // user Role
    public partial class ServerOptions
    {
        public bool IsInRole(RightsAccess rights) => HttpAccessor.HttpContext.User.IsInRole(rights.ToString());
        public bool IsEqualHigher(RightsAccess rights)
        {
            string _rights = UserRole;
            if (string.IsNullOrEmpty(_rights))
                return false;
            RightsAccess userRights;
            if (!Enum.TryParse<RightsAccess>(_rights, out userRights))
                return false;
            return ((int)userRights) >= ((int)rights);
        }

        public bool IsEqualLower(RightsAccess rights)
        {
            string _rights = UserRole;
            if (string.IsNullOrEmpty(_rights))
                return false;
            RightsAccess userRights;
            if (!Enum.TryParse<RightsAccess>(_rights, out userRights))
                return false;
            return ((int)userRights) <= ((int)rights);
        }

        public bool InRole => HttpAccessor.HttpContext.User.IsInRole(UserRole);
    }

    // user Claims / Infos
    public partial class ServerOptions
    {
        public bool IsAuth => HttpCTX?.User?.Identity.IsAuthenticated == true;
        public ClaimsPrincipal User => HttpCTX?.User;
        public string Mail => User?.FindFirst(ClaimTypes.Email)?.Value;
        public string UserRole => User?.FindFirst(ClaimTypes.Role)?.Value;
        public RightsAccess UserRoleEnum 
        {
            get
            {
                RightsAccess userRights;
                if (Enum.TryParse<RightsAccess>(UserRole, out userRights))
                    return userRights;
                return RightsAccess.none;

            }
        }
        public string UserId => User?.FindFirst(ClaimTypes.Sid)?.Value;
        public string UserName => $"{User?.FindFirst(ClaimTypes.Name)?.Value}";
        public string UserSurname => $"{User?.FindFirst(ClaimTypes.GivenName)?.Value}";
        public string UserFullName => $"{UserSurname} {UserName?.ToUpper()}";
        public string GroupName => User?.FindFirst(ClaimTypes.Locality)?.Value;
        public string Author => $"{UserFullName} | ({UserRole}) IP:{IP}";

    }

    // request
    public partial class ServerOptions
    {
        public IHttpContextAccessor HttpAccessor { get; private set; }
        public HttpContext HttpCTX => HttpAccessor?.HttpContext;
        public string HttpID => HttpCTX?.Connection.Id;
        public string HeaderWsToken
        {
            get
            {
                string token = null;
                if (HttpCTX.Request.Headers.ContainsKey(IServerOptions.WsHeaderName))
                     token = HttpCTX.Request.Headers.Where(x => x.Key.Contains(IServerOptions.WsHeaderName))
                        .Select(y => y.Value).FirstOrDefault();

                return token;
            }
        }
        public IWebHostEnvironment HostingEnv { get; private set; }
        public string IP => HttpCTX?.Connection.RemoteIpAddress.ToString();
    }

    // ini Helpers
    public partial class ServerOptions : IServerOptions
    {
      
        private string prefix => HttpAccessor.HttpContext.Request.IsHttps ? "https://" : "http://";
        private string withputPort => $"{prefix}{HttpAccessor.HttpContext.Request.Host.Host}";
        private string port => $"{prefix}{HttpAccessor.HttpContext.Request.Host.Port}";


        public string RootPath => HostingEnv.ContentRootPath;
        public string WebRootPath => HostingEnv.WebRootPath;
        public string ServerUrl => $"{prefix}{HttpAccessor.HttpContext.Request.Host}";

        public string LogTitle([CallerFilePath] string callerFilePath = null, [CallerMemberName] string Method = null) => $"{IP} | {Mail} | {Path.GetFileNameWithoutExtension(callerFilePath)}->{Method} | ";

        public ServerOptions(IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            HttpAccessor = httpContextAccessor;
            HostingEnv = hostingEnvironment;
        }


    }


}
