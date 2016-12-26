using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class FilteredRoutes
    {
        public int DriverID {get;set;}
        public string DriverFirstName {get;set;}
        public string DriverLastName {get;set;}
        public int TruckID {get;set;}
        public string TruckName {get;set;}
        public int RouteID {get;set;}
        public string RouteName {get;set;}
        public string RoutePoints {get;set;}
    }
}