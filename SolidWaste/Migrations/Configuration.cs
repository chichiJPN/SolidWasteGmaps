namespace SolidWaste.Migrations
{
    using SolidWaste.Models;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using System.Web.Security;
    using WebMatrix.WebData;

    internal sealed class Configuration : DbMigrationsConfiguration<SolidWaste.Models.SolidWasteDb>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }


        protected override void Seed(SolidWaste.Models.SolidWasteDb context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //

            var districts = new List<District>
            {
                new District {  Name = "Pamplemousses", 
                                image = "district/Pamplemousses.jpg", 
                                marker_y_coordinate = 57.5684, 
                                marker_x_coordinate = -20.0908,
                                zoomed_y_coordinate = 57.559,
                                zoomed_x_coordinate = -20.112,
                                search_xmin = 57.491,
                                search_xmax = 57.641,
                                search_ymin = -20.004,
                                search_ymax = -20.210,
                                population = 140511,
                                numMunicipalities = 4,
                                FID = 5
                             },
                new District {  Name = "Riviere du Rempart", 
                                image = "district/ReviereDuRempart.jpg", 
                                marker_y_coordinate = 57.6549, 
                                marker_x_coordinate = -20.0663,
                                zoomed_y_coordinate = 57.650,
                                zoomed_x_coordinate = -20.067,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 110235,
                                numMunicipalities = 0,
                                FID = 8
                            },
                new District {  Name = "Flacq", 
                                image = "district/Flacq.jpg", 
                                marker_y_coordinate = 57.7153, 
                                marker_x_coordinate = -20.2326,
                                zoomed_y_coordinate = 57.701,
                                zoomed_x_coordinate = -20.210,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 141586,
                                numMunicipalities = 0,
                                FID = 2
                             },
                new District {  Name = "Moka", 
                                image = "district/Moka.jpg", 
                                marker_y_coordinate = 57.5876, 
                                marker_x_coordinate = -20.2609,
                                zoomed_y_coordinate = 57.588,
                                zoomed_x_coordinate = -20.253,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 81820,
                                numMunicipalities = 0,

                                FID = 4
                             },
                new District {  Name = "Grand Port", 
                                image = "district/GrandPort.jpg", 
                                marker_y_coordinate = 57.6398, 
                                marker_x_coordinate = -20.4026,
                                zoomed_y_coordinate = 57.651,
                                zoomed_x_coordinate = -20.394,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 116211,
                                numMunicipalities = 0,
                                FID = 3
                            },
                new District { 
                                Name = "Plaines Wilhems", 
                                image = "district/PlainesWilhems.jpg", 
                                marker_y_coordinate = 57.5134, 
                                marker_x_coordinate = -20.3292,
                                zoomed_y_coordinate = 57.498,
                                zoomed_x_coordinate = -20.306,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 387372,
                                numMunicipalities = 0,
                                FID = 6
                            },
                new District {  Name = "Savanne", 
                                image = "district/Savanne.jpg", 
                                marker_y_coordinate = 57.5038, 
                                marker_x_coordinate = -20.4592,
                                zoomed_y_coordinate = 57.4945,
                                zoomed_x_coordinate = -20.465,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 70575,
                                FID = 3
                             },
                new District {  Name = "Black River", 
                                image = "district/BlackRiver.jpg", 
                                marker_y_coordinate = 57.4104,
                                marker_x_coordinate = -20.3189,
                                zoomed_y_coordinate = 57.409,
                                zoomed_x_coordinate = -20.33,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 79247,
                                numMunicipalities = 0,
                                FID = 9
                            },
                new District { 
                                Name = "Port Louis", 
                                image = "district/PortLouis.jpg", 
                                marker_y_coordinate = 57.5217, 
                                marker_x_coordinate = -20.1643,
                                zoomed_y_coordinate = 57.522,
                                zoomed_x_coordinate = -20.168,
                                search_ymin = 57.491,
                                search_ymax = 57.641,
                                search_xmin = -20.004,
                                search_xmax = -20.210,
                                population = 127454,
                                numMunicipalities = 0,
                                FID = 7
                            }
            };

            districts.ForEach(s => context.Districts.AddOrUpdate(p => p.Name, s));

            context.SaveChanges();


            var Drivers = new List<Driver>
            {
                new Driver {firstName = "John", lastName = "Cruise"},
                new Driver {firstName = "John", lastName = "Cruiser"},
                new Driver {firstName = "John", lastName = "Cruises"},
                new Driver {firstName = "John", lastName = "Cruisade"},
                new Driver {firstName = "John", lastName = "Cruisey"}
            };

            Drivers.ForEach(s => context.Drivers.AddOrUpdate(p => p.lastName, s));
            context.SaveChanges();

            var Trucks = new List<Truck>
            {
                new Truck { name="Suzy"},
                new Truck { name="Suzanne"},
                new Truck { name="Suzey"},
                new Truck { name="Sushi"},
                new Truck { name="Sukki"},
                new Truck { name="Suwiming"}
            };
            Trucks.ForEach(s => context.Trucks.AddOrUpdate(p => p.name, s));
            context.SaveChanges();

            var Days = new List<Day>
            {
                new Day { day = "Sunday"},
                new Day { day = "Monday" },
                new Day { day = "Tuesday" },
                new Day { day = "Wednesday" },
                new Day { day = "Thursday" },
                new Day { day = "Friday" },
                new Day { day = "Saturday" }
            };
            Days.ForEach(s => context.Days.AddOrUpdate(p => p.day, s));
            context.SaveChanges();


            var municipalities = new List<Municipality>
            {
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Plaines Wilhems").DistrictID,
                    Name = "Municipality of Rose-Hill",
                    Address="Town Hall Royal Road, Rose Hill",	
                    ContactNumber="454 9500",
                    Image = "MunicipalityOfRoseHill.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Plaines Wilhems").DistrictID,
                    Name = "Municipality of Curepipe",
                    Address="Queen Elizabeth Avenue, Curepipe",
                    ContactNumber="(230) 670 48 97",
                    Image = "MunicipalityOfCurepipe.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Port Louis").DistrictID,
                    Name = "Municipality of Port-Louis",
                    Address="Jules Koenig Street, Port-Louis",
                    ContactNumber="(230) 212 0831",
                    Image = "MunicipalityOfPortLouis.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Plaines Wilhems").DistrictID,
                    Name = "Municipality of Vacoas",
                    Address="St-Paul Avenue, Vacoas",
                    ContactNumber="(230) 696 2975",
                    Image = "MunicipalityOfVacoas.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Moka").DistrictID,
                    Name = "District council of Moka-Flacq",
                    Address="Royal Road, Quartier Militaire",
                    ContactNumber="(230) 435 55 31",
                    Image = "DistrictCouncilOfMokaFlacq.jpg"	
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Pamplemousses").DistrictID,
                    Name = "District council of Pamplemousses & Riviere du Rempart",
                    Address="Royal Road, Mapou",
                    ContactNumber=" (230) 266 2095",
                    Image = "DistrictCouncilOfPamplemoussesRiviere.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Black River").DistrictID,
                    Name = "District Council of Black River",
                    Address="Geoffroy Road",
                    ContactNumber="(230) 452 03 04",
                    Image = "DistrictCouncilOfBlackRiver.jpg"
                },
                new Municipality 
                {
                    DistrictID = districts.Single(s => s.Name == "Savanne").DistrictID,
                    Name = "District Council of Grand Port Savanne",
                    Address="Royal Road, Rose Belle",
                    ContactNumber="(230) 627 4575",
                    Image = "DistrictCouncilOfGrandPortSavanne.jpg"
                }
            };
            municipalities.ForEach(s => context.Municipalities.AddOrUpdate(p => new { p.DistrictID, p.Name }, s));
            context.SaveChanges();

            SeedMembership();
        }

        private void SeedMembership()
        {
            WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", autoCreateTables: true);
            var roles = (SimpleRoleProvider)Roles.Provider;
            var membership = (SimpleMembershipProvider)Membership.Provider;

            if (!roles.RoleExists("Admin"))
            {
                roles.CreateRole("Admin");
            }

            if (!roles.RoleExists("Member"))
            {
                roles.CreateRole("Member");
            }


            if (membership.GetUser("junichi", false) == null)
            {
                membership.CreateUserAndAccount("junichi", "junichi");
            }

            if (membership.GetUser("admin", false) == null)
            {
                membership.CreateUserAndAccount("admin", "admin");
            }

            if (membership.GetUser("ham", false) == null)
            {
                membership.CreateUserAndAccount("ham", "ham");
            }


            if (!roles.GetRolesForUser("admin").Contains("Admin"))
            {
                roles.AddUsersToRoles(new[] { "admin" }, new[] { "Admin" });
            }

            if (!roles.GetRolesForUser("junichi").Contains("Admin"))
            {
                roles.AddUsersToRoles(new[] { "junichi" }, new[] { "Admin" });
            }

            if (!roles.GetRolesForUser("ham").Contains("Member"))
            {
                roles.AddUsersToRoles(new[] { "ham" }, new[] { "Member" });
            }

        }

    }
}
