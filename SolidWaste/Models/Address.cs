using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class Address
    {
        public int AddressID { get; set; }

        [Required]
        public int municipalityID { get; set; }
        public string Description { get; set; }

        public virtual Municipality Municipality{get;set;}
    }
}