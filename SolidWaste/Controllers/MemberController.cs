using SolidWaste.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SolidWaste.Controllers
{

    [Authorize]
    public class MemberController : Controller
    {
        //
        // GET: /Member/
        SolidWasteDb _db = new SolidWasteDb();

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Map()
        {
            ViewBag.menu = "maps";
            return View();
        }

        [HttpGet]
        [Authorize]
        public ActionResult District(string name, int id)
        {
            ViewBag.id = id;
            ViewBag.menu = "maps";

            ViewBag.District = _db.Districts.Single(g => g.DistrictID == id);

            ViewBag.districtImage =
                (from d in _db.Districts
                where d.DistrictID == id
                select d.image).Single();

            var model =
                (from m in _db.Municipalities
                 where m.DistrictID == id
                 orderby m.Name descending
                 select m);

            ViewBag.numMunicipalities =
                (from m in _db.Municipalities
                 where m.DistrictID == id
                 select m.DistrictID).Count();

            int userID = (int)Membership.GetUser().ProviderUserKey;

            ViewBag.account =
            (from m in _db.UserProfiles
             where m.UserId == userID
             select m).Single();

            if (User.IsInRole("Admin")) {
                return View("AdminDistrict", model);
            } else  {
                return View(model);
            }
        }
    }
}
