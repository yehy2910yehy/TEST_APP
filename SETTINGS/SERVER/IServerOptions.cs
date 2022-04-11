using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using MODELS;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace SERVER.SETTINGS
{

    // user Role
    public partial interface IServerOptions
    {
        bool IsInRole(RightsAccess right);
        bool IsEqualHigher(RightsAccess right);
        bool IsEqualLower(RightsAccess right);

    }


    // user Claims / Infos
    public partial interface IServerOptions
    {
        bool IsAuth { get; }
        ClaimsPrincipal User { get; }
        string Mail { get; }
        string UserRole { get; }
        RightsAccess UserRoleEnum { get; }
        string UserId { get; }

        string UserName { get; }
        string UserSurname { get; }
        string UserFullName { get; }

        string Author { get; }
        string GroupName { get; }
    }


    // request
    public partial interface IServerOptions
    {
        const string WsHeaderName = "wsToken";

        IHttpContextAccessor HttpAccessor { get; }
        HttpContext HttpCTX { get; }
        string HttpID { get; }
        string HeaderWsToken { get; }
        IWebHostEnvironment HostingEnv { get; }

        string IP { get; }
    }


    //Helpers
    public partial interface IServerOptions
    {
         string RootPath { get; }
        string WebRootPath { get; }
        string ServerUrl { get; }

        string LogTitle([CallerFilePath] string callerFilePath = null, [CallerMemberName] string Method = null);
    }
}
