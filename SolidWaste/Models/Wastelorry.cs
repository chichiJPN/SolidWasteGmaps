using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class Wastelorry
    {
        public int WastelorryID { get; set; }
        public int MunicipalityID { get; set; }
        public int DistrictID { get; set; }
        public string name { get; set; }

        public double? x {get;set;}

        public double? y { get; set; }
        public string boundary { get; set; }


        public virtual District District { get; set; }
    }
}