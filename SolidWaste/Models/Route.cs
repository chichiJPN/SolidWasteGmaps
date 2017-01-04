using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class Route
    {
        public int RouteID { get; set; }
        public int DistrictID { get; set; }

        public int? TruckID { get; set; }
        public int? DriverID { get; set; }

        public int? DayID { get; set; }
        public string name { get; set; }
        public string points { get; set; }


        public virtual Day Day { get; set; }
        public virtual Truck Truck { get; set; }
        public virtual Driver Driver { get; set; }
        public virtual District District { get; set; }
    }
}