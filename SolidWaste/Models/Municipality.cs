using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class Municipality
    {
        public int MunicipalityID { get; set; }

        [Required]
        public int DistrictID { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Image { get; set; }
        public string ContactNumber { get; set; }
        public double? x_coordinate { get; set; }
        public double? y_coordinate { get; set; }

        public string boundary { get; set; }
        public virtual District District {get;set;}
        public virtual ICollection<Address> Addresses { get; set; }
    }
}