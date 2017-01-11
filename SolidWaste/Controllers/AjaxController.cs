using SolidWaste.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;


namespace SolidWaste.Controllers
{
    public class AjaxController : Controller
    {
        SolidWasteDb _db = new SolidWasteDb();
        //
        // GET: /Ajax/

        [HttpPost]
        [Authorize]
        public ActionResult UpdateAccountMember(double x, double y, string address)
        {
            int userID = (int)Membership.GetUser().ProviderUserKey;
            UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId == userID);

            userprofile.x = x;
            userprofile.y = y;
            userprofile.Address = address;
            userprofile.AccountStatus = "For Verification";
            _db.SaveChanges();

            return null; 
        }


        [HttpPost]
        [Authorize]
        public ActionResult GetDriversAndTrucksAndDays()
        {

            var model = new
            {
                Drivers = getDrivers(),
                Trucks = getTrucks(),
                Days = GetDays()
            };

            return Json(model, JsonRequestBehavior.AllowGet);
        }
        



        [HttpPost]
        [Authorize]
        public ActionResult GetDistricts()
        {
            var model =
                _db.Districts
                    .Select(r => new
                    {
                        id = r.DistrictID,
                        name = r.Name,
                        x_coor = r.marker_x_coordinate,
                        y_coor = r.marker_y_coordinate
                    });
            return Json(model, JsonRequestBehavior.AllowGet);
        }


        // returns municipalities and district location
        [HttpPost]
        [Authorize]
        public ActionResult GetMunicipalities(int DistrictID)
        {
            var DistrictModel =
                _db.Municipalities
                    .Where(c => c.DistrictID == DistrictID)
                    .Select(r => new
                    {
                        id = r.DistrictID,
                        MunicipalityID = r.MunicipalityID,
                        ImageSrc = r.Image,
                        name = r.Name,
                        Address = r.Address,
                        ContactNumber = r.ContactNumber,
                        x_coor = r.x_coordinate,
                        y_coor = r.y_coordinate,
                        boundary = r.boundary,
                        numLorries = (_db.Wastelorries
                                         .Where(d=> d.MunicipalityID == r.MunicipalityID )
                                         .Count())
                    });
            return Json(DistrictModel, JsonRequestBehavior.AllowGet);
        }

        // returns municipalities and district location
        [HttpPost]
        [Authorize(Roles="Admin")]
        public ActionResult updateMunicipalityBoundary(int id, string boundaries)
        {
            Municipality municipality = _db.Municipalities.SingleOrDefault(d => d.MunicipalityID == id);

            municipality.boundary = boundaries;

            _db.SaveChanges();

            return null;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult updateLorryBoundary(int id, string boundaries)
        {
            Wastelorry wastelorry = _db.Wastelorries.SingleOrDefault(d => d.WastelorryID == id);
            wastelorry.boundary = boundaries;
            _db.SaveChanges();

            return null;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateMunicipalityLocation(int MunicipalityID, double x, double y)
        {
            Municipality municipality = _db.Municipalities.SingleOrDefault(d => d.MunicipalityID == MunicipalityID);
            municipality.x_coordinate = x;
            municipality.y_coordinate = y;
            _db.SaveChanges();

            return null;
        }

                

        // returns municipalities and district location
        [HttpPost]
        [Authorize]
        public ActionResult GetLorries(int DistrictID)
        {

            var LorryModel =
                //_db.Wastelorries
                //    .Where(c => c.DistrictID == DistrictID)
                //    .Select(r => new
                //    {
                //        id = r.WastelorryID,
                //        name = r.name,
                //        x  = r.x,
                //        y = r.y
                //    });
                from lorries in _db.Wastelorries
                join m in _db.Municipalities on lorries.MunicipalityID equals m.MunicipalityID into bag2
                from municipalities in bag2.DefaultIfEmpty()
                where lorries.DistrictID == DistrictID
                select new
                {
                    id = lorries.WastelorryID,
                    name = lorries.name,
                    x  = lorries.x,
                    y = lorries.y,
                    MunicipalityName = municipalities == null ? null : municipalities.Name,
                    MunicipalityID = municipalities == null ? -1 : municipalities.MunicipalityID
                };
            return Json(LorryModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateLorryName(int lorryID, string name)
        {
            Wastelorry wastelorry = _db.Wastelorries.Find(lorryID);
            wastelorry.name = name;

            _db.SaveChanges();
            return Json(new { flag = true });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteLorry(int lorryID)
        {
            Wastelorry wastelorry = _db.Wastelorries.Find(lorryID);
            _db.Wastelorries.Remove(wastelorry);

            _db.SaveChanges();
            return Json(new { flag = true });
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult addlorry(int municipalityID, int districtID, double x, double y, string name)
        {
            Wastelorry wastelorry = new Wastelorry();

            wastelorry.MunicipalityID = municipalityID;
            wastelorry.DistrictID = districtID;
            wastelorry.x = x;
            wastelorry.y = y;
            wastelorry.name = name;

            _db.Wastelorries.Add(wastelorry);

            _db.SaveChanges();

            int id = wastelorry.WastelorryID;
            return Json(new { id = id });
        }

        // function to be called when district page is newly loaded
        [HttpPost]
        [Authorize]
        public ActionResult GetDistrictData(int DistrictID)
        {

            var Model = new
            {
                Lorries = GetLorries(DistrictID),
                Municipalities = GetMunicipalities(DistrictID),
                UserProfiles = GetUserProfiles(DistrictID)
            };
                
            return Json(Model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult GetUserProfiles(int DistrictID)
        {
            var Model =
                from userprofile in _db.UserProfiles
                where userprofile.DistrictID == DistrictID
                select new
                {
                    UserId = userprofile.UserId,
                    Address = userprofile.Address,
                    x = userprofile.x,
                    y = userprofile.y,
                    FirstName = userprofile.FirstName,
                    LastName = userprofile.LastName,
                    AccountStatus = userprofile.AccountStatus,
                    RouteID = userprofile.RouteID
                };

            return Json(Model, JsonRequestBehavior.AllowGet);
        }


        // returns municipalities and district location
        [HttpPost]
        [Authorize]
        public ActionResult GetRoutes(int DistrictID)
        {

            var RoutesModel =
                from routes in _db.Routes
                join d in _db.Drivers on routes.DriverID equals d.DriverID into bag1
                from drivers in bag1.DefaultIfEmpty()
                join t in _db.Trucks on routes.TruckID equals t.TruckID into bag2
                from trucks in bag2.DefaultIfEmpty()
                where routes.DistrictID == DistrictID
                select new
                {
                    DriverID = drivers == null ? -1 : drivers.DriverID, 
                    DriverFirstName = drivers == null ? null : drivers.firstName,
                    DriverLastName = drivers == null ? null : drivers.lastName,
                    TruckID = trucks == null ? -1 : trucks.TruckID,
                    TruckName = trucks == null ? null : trucks.name,
                    RouteID = routes.RouteID,
                    RouteName = routes.name,
                    RoutePoints = routes.points
                };
            return Json(RoutesModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult GetRouteData(int RouteID)
        {

            var RoutesModel =
                from routes in _db.Routes
                join d in _db.Days on routes.DayID equals d.DayID into bag2
                from days in bag2.DefaultIfEmpty()
                where routes.RouteID == RouteID
                select new
                {
                    DayName = days == null ? null : days.day,
                    RouteID = routes.RouteID,
                    RouteName = routes.name,
                    RoutePoints = routes.points
                };
            return Json(RoutesModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult GetRoutesByFilter(int DistrictID, int TruckID, int DriverID, int DayID)
        {
            var RoutesModel =
                from routes in _db.Routes
                join d in _db.Drivers on routes.DriverID equals d.DriverID into bag1
                from drivers in bag1.DefaultIfEmpty()
                join t in _db.Trucks on routes.TruckID equals t.TruckID into bag2
                from trucks in bag2.DefaultIfEmpty()
                join da in _db.Days on routes.DayID equals da.DayID into bag3
                from days in bag3.DefaultIfEmpty()

                where routes.DistrictID == DistrictID && ( TruckID == -1 || routes.TruckID == TruckID ) && (DriverID == -1 || routes.DriverID == DriverID)
                && (DayID == -1 || routes.DayID == DayID)
                select new
                {
                    DriverID = drivers == null ? -1 : drivers.DriverID,
                    DriverFirstName = drivers == null ? null : drivers.firstName,
                    DriverLastName = drivers == null ? null : drivers.lastName,
                    TruckID = trucks == null ? -1 : trucks.TruckID,
                    TruckName = trucks == null ? null : trucks.name,
                    RouteID = routes.RouteID,
                    RouteName = routes.name,
                    RoutePoints = routes.points,
                    dayid = days == null ? -1 : days.DayID,
                    Day = days == null ? null : days.day
                };
            return Json(RoutesModel, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        [Authorize]
        public ActionResult GetTest(int DistrictID)
        {
            var RoutesModel =
                        from routes in _db.Routes
                        join d in _db.Drivers on routes.DriverID equals d.DriverID into bag1
                        from drivers in bag1.DefaultIfEmpty()
                        join t in _db.Trucks on routes.TruckID equals t.TruckID into bag2
                        from trucks in bag2.DefaultIfEmpty()
                        where routes.DistrictID == DistrictID
                        select new
                        {
                            DriverID = drivers == null ? -1 : drivers.DriverID, 
                            DriverFirstName = drivers == null ? null : drivers.firstName,
                            DriverLastName = drivers == null ? null : drivers.lastName,
                            TruckID = trucks == null ? -1 : trucks.TruckID,
                            TruckName = trucks == null ? null : trucks.name,
                            RouteID = routes.RouteID,
                            RouteName = routes.name,
                            RoutePoints = routes.points
                        };

            return Json(RoutesModel, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddRoute(int districtID, string points, string name)
        {
            Route route = new Route();

            route.DistrictID = districtID;
            route.points = points;
            route.name = name;
            _db.Routes.Add(route);

            _db.SaveChanges();

            int id = route.RouteID;
            return Json(new { id = id });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteRoute(int RouteID)
        {
            var userprofiles = _db.UserProfiles.Where(x => x.RouteID == RouteID);
            //db.Entry(selectedCourse).Collection(x => x.Enrollments).Load();
            foreach (UserProfile profile in userprofiles)
            {
                profile.RouteID = null;
            }
            _db.SaveChanges();

            Route route = _db.Routes.Find(RouteID);
            _db.Routes.Remove(route);
            _db.SaveChanges();
            return Json(new { flag = true });
        }

        [HttpPost]
        [Authorize]
        public ActionResult UpdateCollectionFlag(int flag)
        {
            int userID = (int)Membership.GetUser().ProviderUserKey;
            UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId == userID);

            if (userprofile != null)
            {
                userprofile.collectionFlag = flag;
            }

            _db.SaveChanges();

            return Json(new { flag = userID });
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateUserRoutes(int routeID, int[] userIDs)
        {
            foreach (var userID in userIDs)
            {
                UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId == userID);
                if (userprofile != null) {
                    userprofile.RouteID = routeID;
                }

            }
            _db.SaveChanges();

            return Json(new { flag = true });
        }
        
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult RemoveRouteFromUser(int userID)
        {
            UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId == userID);
            userprofile.RouteID = null;
            
            _db.SaveChanges();

            return Json(new { flag = true });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult RejectUser(int userID, string rejectMessage)
        {
            UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId == userID);
            userprofile.AccountStatus = "Rejected";
            userprofile.RejectMessage = rejectMessage;
            _db.SaveChanges();

            return Json(new { flag = true });
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult updateRoute(int routeID, int truckID, int driverID, int dayID)
        {
            Route route = _db.Routes.SingleOrDefault(d => d.RouteID == routeID);
            if (driverID == -1) { route.DriverID = null; }
            else { route.DriverID = driverID; }

            if (truckID == -1) { route.TruckID = null; }
            else { route.TruckID = truckID; }

            if (driverID == -1) { route.DriverID = null; }
            else { route.DriverID = driverID; }

            if (dayID == -1) { route.DayID= null; }
            else { route.DayID = dayID; }

            _db.SaveChanges();

            return null;
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult VerifyUser(int UserID)
        {
            UserProfile userprofile = _db.UserProfiles.SingleOrDefault(d => d.UserId== UserID);
            userprofile.AccountStatus = "Verified";
            _db.SaveChanges();

            return null;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateTruck(int truckID, string name)
        {
            Truck truck = _db.Trucks.SingleOrDefault(d => d.TruckID == truckID);

            truck.name = name;

            _db.SaveChanges();

            return null;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult UpdateDriver(int driverID, string firstName, string lastName)
        {
            Driver driver = _db.Drivers.SingleOrDefault(d => d.DriverID == driverID);

            driver.firstName = firstName;
            driver.lastName = lastName;

            _db.SaveChanges();

            return null;
        }


        [HttpPost]
        [Authorize]
        public ActionResult getDrivers()
        {
            var Model =
                _db.Drivers
                    .Select(r => new
                    {
                        id = r.DriverID,
                        firstName = r.firstName,
                        lastName = r.lastName
                    })
                    .OrderByDescending(s => s.id);
            return Json(Model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize]
        public ActionResult GetDays()
        {
            var Model =
                _db.Days
                    .Select(r => new
                    {
                        id = r.DayID,
                        name = r.day
                    });
                    //.OrderByDescending(s => s.id);
            return Json(Model, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddDriver(string firstName, string lastName)
        {
            Driver driver = new Driver();

            driver.firstName = firstName;
            driver.lastName = lastName;
            _db.Drivers.Add(driver);

            _db.SaveChanges();

            int id = driver.DriverID;

            return Json(new { id = id });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteDriver(int DriverID)
        {
            var routes = _db.Routes.Where(d => d.DriverID == DriverID);

            if (routes.Any())
            {
                foreach (var route in routes)
                {
                    route.DriverID = null;
                }
            }

            Driver driver = _db.Drivers.Find(DriverID);
            _db.Drivers.Remove(driver);
            _db.SaveChanges();
            return Json(new { flag = true });
        }

        [HttpPost]
        [Authorize]
        public ActionResult getTrucks()
        {
            var Model =
                _db.Trucks
                    .Select(r => new
                    {
                        id = r.TruckID,
                        name = r.name
                    })
                    .OrderByDescending(s => s.id);

            return Json(Model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult AddTruck(string name)
        {
            Truck truck = new Truck();

            truck.name = name;
            _db.Trucks.Add(truck);

            _db.SaveChanges();

            int id = truck.TruckID;

            return Json(new { id = id });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteTruck(int TruckID)
        {
            var routes = _db.Routes.Where(d => d.TruckID == TruckID);
                
            if (routes.Any()) {
                foreach (var route in routes) {
                   route.TruckID = null;
                }
            }

            Truck truck = _db.Trucks.Find(TruckID);
            _db.Trucks.Remove(truck);
            _db.SaveChanges();
            return Json(new { flag = true });
        }

    }
}
