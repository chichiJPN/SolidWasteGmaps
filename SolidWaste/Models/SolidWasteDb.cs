using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Web;

namespace SolidWaste.Models
{
    public class SolidWasteDb : DbContext
    {
        public SolidWasteDb()
            : base("name=DefaultConnection")
        { }

        //public DbSet<Role> Roles { get; set; }
        //public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        public DbSet<District> Districts { get; set; }
        public DbSet<Municipality> Municipalities { get; set; }
        public DbSet<Address> Addresses{ get; set; }

        public DbSet<Truck> Trucks { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Wastelorry> Wastelorries { get; set; }
        public DbSet<Route> Routes { get; set; }

        public DbSet<Day> Days { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}