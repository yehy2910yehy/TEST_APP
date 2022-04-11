using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SERVER.SETTINGS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
namespace SERVER.FILES
{
    [Route("files")]
    public partial class FilesController : ControllerBase
    {
        private ILogger<FilesController> Logger;
        private IServerOptions ServerOptions;
        public FilesController(ILogger<FilesController> _logger, IServerOptions serverOptions)
        {
            Logger = _logger;
            ServerOptions = serverOptions;
        }
        [HttpPost, Route("upload")]
        public async Task<IActionResult> Upload(IList<IFormFile> files)
        {
            IActionResult result = BadRequest();
            try
            {
                string name = "";
                foreach (IFormFile file in files)
                {
                    //if (!fileOk(file.FileName))
                    //    throw new Exception("Invalid format!");
                    var path = $"{ServerOptions.RootPath}\\FILES\\{file.FileName}";
                    using (Stream fileStream = new FileStream(path, FileMode.Create))
                        await file.CopyToAsync(fileStream);
                    // if .bin return gltf
                    var ext = Path.GetExtension(file.FileName);
                    if (ext == ".bin")
                        name = $"{Path.GetFileNameWithoutExtension(file.FileName)}.gltf";
                    else
                        name = $"{file.FileName}";
                    Logger.LogInformation($"{ServerOptions.LogTitle()} {file.FileName}");
                }
                Logger.LogInformation($"{name}");
                result = Ok($"{name}");
            }
            catch (Exception ex)
            {
                result = BadRequest(ex.Message);
            }
            return result;
        }
        [HttpGet, Route("loadFile/{*fileName}")]
        public IActionResult LoadFile(string fileName)
        {
            IActionResult result = BadRequest();
            try
            {
                //if (!fileOk(fileName))
                //    throw new Exception("Invalid format!");
                var ext = Path.GetExtension(fileName);
                fileName = fileName.Replace("/", @"\");
                var path = $"{ServerOptions.RootPath}\\FILES\\{fileName}";
                if (!System.IO.File.Exists(path))
                    throw new Exception($"File {fileName} not found.");
                Logger.LogInformation($"{path}");
                //   FileStream SourceStream = System.IO.File.Open(path, FileMode.OpenOrCreate);
                var arr = System.IO.File.ReadAllBytes(path);
                var mime = getMime(fileName);
                result = File(arr, mime);
            }
            catch (Exception ex)
            {
                Logger.LogError($"{ex.Message}");
                result = BadRequest(ex.Message);
            }
            return result;
        }
    }
    public partial class FilesController
    {
        string[] extValid = new string[] { ".stl", ".ply", ".gltf", ".obj", ".bin" };
        bool fileOk(string name)
        {
            var ext = Path.GetExtension(name);
            return extValid.Contains(ext);
        }
        static Dictionary<string, string> mimeDic = new Dictionary<string, string>
        {
             {".jpeg", "image/jpeg"},
        {".jpg", "image/jpeg"},
         {".png", "image/png"},
         {".gltf", "application/json"},
          {".txt", "text/plain"},
          {".bin", "application/x-binary"},
           {".glb", "application/x-binary"},
            {".obj", "application/x-binary"},
        };
        static string getMime(string fileName)
        {
            var ext = Path.GetExtension(fileName);
            string mime = string.Empty;
            if (mimeDic.ContainsKey(ext))
                mime = mimeDic[ext];
            mime = string.IsNullOrEmpty(mime) ? "application/octet-stream" : mime;
            return mime;
        }
    }
}
