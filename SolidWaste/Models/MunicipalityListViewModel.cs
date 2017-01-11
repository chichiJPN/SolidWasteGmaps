using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class MunicipalityListViewModel
    {
        public District District { get; set; }
        public IEnumerable<Municipality> Municipalities { get; set; }
    }
}