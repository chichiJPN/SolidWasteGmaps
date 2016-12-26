using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SolidWaste.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.menu = "home";
            return View();
        }


        public ActionResult About()
        {
            ViewBag.menu = "about";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.menu = "contact";

            return View();
        }
        public ActionResult TopManagement()
        {
            ViewBag.menu = "topmanagement";

            return View();
        }

        public ActionResult RecyclingCollection()
        {
            ViewBag.menu = "recyclingcollection";
            return View();
        }
        public ActionResult IndustrialCollection()
        {
            ViewBag.menu = "industrialcollection";
            return View();
        }
        public ActionResult CardboardCollection()
        {
            ViewBag.menu = "cardboardcollection";
            return View();
        }

    }
}
