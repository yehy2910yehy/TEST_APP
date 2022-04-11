using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SERVER.SETTINGS;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SERVER
{

    public partial class RouteController : Controller
    {
        private IRouteService RouteService;
      
        private IServerOptions ServerOptions;
        private ILogger<RouteController> logger;
       

        public RouteController(IRouteService routeService, IServerOptions serverOptions,ILogger<RouteController> _logger )
        {
            logger = _logger;
            RouteService = routeService;
            ServerOptions = serverOptions;
           
        }

        // GET: api/values
        [HttpGet, Route("partial/{url}")]
        public IActionResult PartialUrl(string url)
        {
            try
            {
                logger.LogInformation($"partial {url}");

                if (Path.HasExtension(url))
                    return Ok();

            
                logger.LogInformation($"{ServerOptions.UserFullName} |is Auth: {ServerOptions.IsAuth} | {url}");


                return RouteService.ValidatePage(url);
                // return await ValidatePage(url);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest(ex.Message);
            }
        }



       // [HttpGet, Route("{*url}")]
        public IActionResult AnyUrl(string url)

        {

            try
            {
                logger.LogInformation(url);


                // if it is a file (.css / .js)'don't treat it 
                if (Path.HasExtension(url))
                    return Ok();


                logger.LogInformation($"{ServerOptions.LogTitle()} {url}");

                if (String.IsNullOrWhiteSpace(url))
                    return RouteService.IndexPage;
                     
                
                 

                return RouteService.ValidatePage(url);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest(ex.Message);
            }
        }



        /// <summary>
        ///  no need to handle errors on server side 
        ///  
        /// Client side does it in Auth.js
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>

        [HttpGet, Route("error/{code}")]
        public async Task<IActionResult> error(string code)
        {
            try
            {
                if (code == "401")
                    return Ok("no authenticated");

                if (code == "404")
                    return Ok("page introuuvableee !!");


                return Ok("la on est dans de beaux draps");



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet, Route("error")]
        public async Task<IActionResult> error2()
        {
            try
            {


                return Ok("la on est dans de beaux draps");



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpGet, Route("test")]
        public async Task<IActionResult> test()
        {
            try
            {

            
                return RouteService.ValidatePage("test");




            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


   

    }


}
