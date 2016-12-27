namespace SolidWaste.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class junichi : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.UserProfile",
                c => new
                    {
                        UserId = c.Int(nullable: false, identity: true),
                        UserName = c.String(),
                        FirstName = c.String(),
                        LastName = c.String(),
                    })
                .PrimaryKey(t => t.UserId);
            
            CreateTable(
                "dbo.District",
                c => new
                    {
                        DistrictID = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        marker_x_coordinate = c.Double(nullable: false),
                        marker_y_coordinate = c.Double(nullable: false),
                        zoomed_x_coordinate = c.Double(nullable: false),
                        zoomed_y_coordinate = c.Double(nullable: false),
                        search_xmin = c.Double(nullable: false),
                        search_ymin = c.Double(nullable: false),
                        search_xmax = c.Double(nullable: false),
                        search_ymax = c.Double(nullable: false),
                        FID = c.Int(nullable: false),
                        population = c.Int(nullable: false),
                        numMunicipalities = c.Int(nullable: false),
                        image = c.String(),
                    })
                .PrimaryKey(t => t.DistrictID);
            
            CreateTable(
                "dbo.Municipality",
                c => new
                    {
                        MunicipalityID = c.Int(nullable: false, identity: true),
                        DistrictID = c.Int(nullable: false),
                        Name = c.String(),
                        Address = c.String(),
                        ContactNumber = c.String(),
                        x_coordinate = c.Double(),
                        y_coordinate = c.Double(),
                        boundary = c.String(),
                    })
                .PrimaryKey(t => t.MunicipalityID)
                .ForeignKey("dbo.District", t => t.DistrictID, cascadeDelete: true)
                .Index(t => t.DistrictID);
            
            CreateTable(
                "dbo.Address",
                c => new
                    {
                        AddressID = c.Int(nullable: false, identity: true),
                        municipalityID = c.Int(nullable: false),
                        Description = c.String(),
                    })
                .PrimaryKey(t => t.AddressID)
                .ForeignKey("dbo.Municipality", t => t.municipalityID, cascadeDelete: true)
                .Index(t => t.municipalityID);
            
            CreateTable(
                "dbo.Truck",
                c => new
                    {
                        TruckID = c.Int(nullable: false, identity: true),
                        name = c.String(),
                    })
                .PrimaryKey(t => t.TruckID);
            
            CreateTable(
                "dbo.Driver",
                c => new
                    {
                        DriverID = c.Int(nullable: false, identity: true),
                        firstName = c.String(),
                        lastName = c.String(),
                    })
                .PrimaryKey(t => t.DriverID);
            
            CreateTable(
                "dbo.Wastelorry",
                c => new
                    {
                        WastelorryID = c.Int(nullable: false, identity: true),
                        MunicipalityID = c.Int(nullable: false),
                        DistrictID = c.Int(nullable: false),
                        name = c.String(),
                        x = c.Double(),
                        y = c.Double(),
                        boundary = c.String(),
                    })
                .PrimaryKey(t => t.WastelorryID)
                .ForeignKey("dbo.District", t => t.DistrictID, cascadeDelete: true)
                .Index(t => t.DistrictID);
            
            CreateTable(
                "dbo.Route",
                c => new
                    {
                        RouteID = c.Int(nullable: false, identity: true),
                        DistrictID = c.Int(nullable: false),
                        TruckID = c.Int(),
                        DriverID = c.Int(),
                        DayID = c.Int(),
                        name = c.String(),
                        points = c.String(),
                    })
                .PrimaryKey(t => t.RouteID)
                .ForeignKey("dbo.Day", t => t.DayID)
                .ForeignKey("dbo.Truck", t => t.TruckID)
                .ForeignKey("dbo.Driver", t => t.DriverID)
                .ForeignKey("dbo.District", t => t.DistrictID, cascadeDelete: true)
                .Index(t => t.DayID)
                .Index(t => t.TruckID)
                .Index(t => t.DriverID)
                .Index(t => t.DistrictID);
            
            CreateTable(
                "dbo.Day",
                c => new
                    {
                        DayID = c.Int(nullable: false, identity: true),
                        day = c.String(),
                    })
                .PrimaryKey(t => t.DayID);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.Route", new[] { "DistrictID" });
            DropIndex("dbo.Route", new[] { "DriverID" });
            DropIndex("dbo.Route", new[] { "TruckID" });
            DropIndex("dbo.Route", new[] { "DayID" });
            DropIndex("dbo.Wastelorry", new[] { "DistrictID" });
            DropIndex("dbo.Address", new[] { "municipalityID" });
            DropIndex("dbo.Municipality", new[] { "DistrictID" });
            DropForeignKey("dbo.Route", "DistrictID", "dbo.District");
            DropForeignKey("dbo.Route", "DriverID", "dbo.Driver");
            DropForeignKey("dbo.Route", "TruckID", "dbo.Truck");
            DropForeignKey("dbo.Route", "DayID", "dbo.Day");
            DropForeignKey("dbo.Wastelorry", "DistrictID", "dbo.District");
            DropForeignKey("dbo.Address", "municipalityID", "dbo.Municipality");
            DropForeignKey("dbo.Municipality", "DistrictID", "dbo.District");
            DropTable("dbo.Day");
            DropTable("dbo.Route");
            DropTable("dbo.Wastelorry");
            DropTable("dbo.Driver");
            DropTable("dbo.Truck");
            DropTable("dbo.Address");
            DropTable("dbo.Municipality");
            DropTable("dbo.District");
            DropTable("dbo.UserProfile");
        }
    }
}
