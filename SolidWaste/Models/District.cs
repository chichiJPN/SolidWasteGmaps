using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class District
    {
        public int DistrictID { get; set; }
        public string Name { get; set; }
        public double marker_x_coordinate { get; set; }
        public double marker_y_coordinate { get; set; }

        public double zoomed_x_coordinate { get; set; }
        public double zoomed_y_coordinate { get; set; }

        public double search_xmin { get; set; }
        public double search_ymin { get; set; }
        public double search_xmax { get; set; }
        public double search_ymax { get; set; }
        public int FID { get; set; }
        public int population { get; set; }

        public int numMunicipalities { get; set; }
        public string image { get; set; }

        public virtual ICollection<Municipality> Municipalities { get; set; }

    }
}