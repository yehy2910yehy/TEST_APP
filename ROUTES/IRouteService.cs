using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MODELS;
using SERVER.SETTINGS;
using System.Collections.Generic;
using System.Linq;
using System.Net;
namespace SERVER
{
    public class PageRouteModel
    {
        public string Path { get; set; }
        public RightsAccess Rights { get; set; }
        public bool IncludeHigher { get; set; }
        public PageRouteModel(string path, RightsAccess rights = RightsAccess.none, bool higher = true)
        {
            Path = path;
            Rights = rights;
            IncludeHigher = higher;
        }
    }
    public interface IRouteService
    {
        public IRouteService Initialize();
        public IActionResult ValidatePage(string url);
        public IActionResult IndexPage { get; }
        public IActionResult LoginPage { get; }
        public IActionResult NotFoundPage { get; }
        public IActionResult ReplyPage(ThemeEnum theme, object swipeArg);
        public IActionResult ReplyPage(ThemeEnum theme, string titre, string message, string html = null);
        IActionResult ViewFromPath(string location);
        IActionResult ViewFromTxt(string txt);
    }
    //helpers params
    public partial class RouteService
    {
        private IServerOptions ServerOptions;
        private PathSettings FolderPath;
        string MainFolder => $@"{ServerOptions.RootPath}\{FolderPath.mainFolder}";
        string PartialFoder => $@"{ServerOptions.RootPath}\{FolderPath.partialFolder}";
        string SpecialFoder => $@"{ServerOptions.RootPath}\{FolderPath.replyFolder}";
        Dictionary<string, PageRouteModel> ReferenceDictionary = new Dictionary<string, PageRouteModel>();
        void FillDIctionary()
        {
            ReferenceDictionary.Add("test", new PageRouteModel($@"{MainFolder}\test.html"));
            ReferenceDictionary.Add("home", new PageRouteModel($@"{MainFolder}\container.html"));
            ReferenceDictionary.Add("login", new PageRouteModel($@"{MainFolder}\login.html"));
            ReferenceDictionary.Add("notfound", new PageRouteModel($@"{MainFolder}\notfound.html"));
            ReferenceDictionary.Add("subscribe", new PageRouteModel($@"{MainFolder}\subscribe.html"));
            // partials
            ReferenceDictionary.Add("dashboard", new PageRouteModel($@"{PartialFoder}\dashboard.html", rights: RightsAccess.none));
            ReferenceDictionary.Add("client", new PageRouteModel($@"{PartialFoder}\client.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("gestion", new PageRouteModel($@"{PartialFoder}\gestion.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("robot", new PageRouteModel($@"{PartialFoder}\robot.html", rights: RightsAccess.Manager));
            ReferenceDictionary.Add("settings", new PageRouteModel($@"{PartialFoder}\settings.html", rights: RightsAccess.Manager));


            ReferenceDictionary.Add("devis", new PageRouteModel($@"{PartialFoder}\devis.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("bulletin", new PageRouteModel($@"{PartialFoder}\bulletin.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("payement", new PageRouteModel($@"{PartialFoder}\payement.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("reservation", new PageRouteModel($@"{PartialFoder}\reservation.html", rights: RightsAccess.Level_1));
            ReferenceDictionary.Add("suivi", new PageRouteModel($@"{PartialFoder}\suivi.html", rights: RightsAccess.Level_1));
          
        }
        public IActionResult ViewFromPath(string location)
        {
            if (!System.IO.File.Exists(location))
                return NotFoundPage;
            // CHECK Cache
            var txt = System.IO.File.ReadAllText(location).Trim();
            return new ContentResult
            {
                ContentType = "text/html; charset=utf-8",
                StatusCode = (int)HttpStatusCode.OK,
                Content = txt
            };
        }
        public IActionResult ViewFromTxt(string txt)
        {
            // CHECK Cache
            return new ContentResult
            {
                ContentType = "text/html; charset=utf-8",
                StatusCode = (int)HttpStatusCode.OK,
                Content = txt.Trim()
            };
        }
    }
    public partial class RouteService : IRouteService
    {
        public IActionResult IndexPage => ValidatePage("home");
        public IActionResult NotFoundPage => ValidatePage("notfound");
        public IActionResult LoginPage => ValidatePage("login");
        public RouteService(IServerOptions serverOptions, IOptions<PathSettings> folderOptions)
        {
            ServerOptions = serverOptions;
            FolderPath = folderOptions.Value;
        }
        public IRouteService Initialize()
        {
            FillDIctionary();
            return this;
        }
        public IActionResult ValidatePage(string request)
        {

            var role = ServerOptions.UserRole;

            if (string.IsNullOrWhiteSpace(request) || !ReferenceDictionary.ContainsKey(request))
                return NotFoundPage;
            var page = ReferenceDictionary[request];
            if (page.Rights == RightsAccess.none)
                return ViewFromPath(page.Path);
            else if (page.IncludeHigher && ServerOptions.IsEqualHigher(page.Rights))
                return ViewFromPath(page.Path);
            else if (!page.IncludeHigher && ServerOptions.IsInRole(page.Rights))
                return ViewFromPath(page.Path);
            else
                return LoginPage;
        }
        public IActionResult ReplyPage(ThemeEnum page, object swipeArg)
        {
            var path = $@"{SpecialFoder}\";
            switch (page)
            {
                case ThemeEnum.welcome:
                    path += "welcome.html";
                    break;
                case ThemeEnum.Error:
                    path += "error.html";
                    break;
                case ThemeEnum.Info:
                    path += "info.html";
                    break;
                case ThemeEnum.Ok:
                    path += "ok.html";
                    break;
                case ThemeEnum.warning:
                    path += "warning.html";
                    break;
            }
            if (!System.IO.File.Exists(path))
                return NotFoundPage;
            var txt = System.IO.File.ReadAllText(path).Trim();
            var swipeList = new Dictionary<string, string>();
            var props = swipeArg?.GetType().GetProperties()?.ToList();
            if (props?.Count > 0)
                foreach (var p in props)
                {
                    var key = $"#{p.Name}";
                    string val = p.GetValue(swipeArg)?.ToString();
                    txt = txt.Replace(key, val);
                }
            //remove #html balise if not set
            if (props != null && !props.Any(x => x.Name == "html"))
                txt = txt.Replace("#html", "");
            return new ContentResult
            {
                ContentType = "text/html; charset=utf-8",
                StatusCode = (int)HttpStatusCode.OK,
                Content = txt
            };
        }
        public IActionResult ReplyPage(ThemeEnum page, string titre, string message, string html = null)
        {
            var path = $@"{SpecialFoder}\";
            switch (page)
            {
                case ThemeEnum.welcome:
                    path += "welcome.html";
                    break;
                case ThemeEnum.Error:
                    path += "error.html";
                    break;
                case ThemeEnum.Info:
                    path += "info.html";
                    break;
                case ThemeEnum.Ok:
                    path += "ok.html";
                    break;
                case ThemeEnum.warning:
                    path += "warning.html";
                    break;
            }
            if (!System.IO.File.Exists(path))
                return NotFoundPage;
            var txt = System.IO.File.ReadAllText(path).Trim();
            txt = txt.Replace("#titre", titre);
            txt = txt.Replace("#message", message);
            if (!string.IsNullOrEmpty(html))
                txt = txt.Replace("#html", html);
            else
                txt = txt.Replace("#html", "");
            return new ContentResult
            {
                ContentType = "text/html; charset=utf-8",
                StatusCode = (int)HttpStatusCode.OK,
                Content = txt
            };
        }
    }
}
