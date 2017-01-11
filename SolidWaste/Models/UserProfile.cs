using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    [Table("UserProfile")]
    public class UserProfile
    {
        [Key]
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Address { get; set; }
        public int? DistrictID { get; set; }

        public int? RouteID { get; set; }

        [DefaultValue("Not Verified")]
        public string AccountStatus { get; set; }

        public string RejectMessage { get; set; }
        public double? x { get; set; }
        public double? y { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int collectionFlag { get; set; }
        public virtual District District { get; set; }

        public virtual Route Route { get; set; }
    }

}