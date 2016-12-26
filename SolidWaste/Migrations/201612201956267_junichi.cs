namespace SolidWaste.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class junichi : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Driver", "TruckID", "dbo.Truck");
            DropIndex("dbo.Driver", new[] { "TruckID" });
            DropColumn("dbo.Driver", "TruckID");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Driver", "TruckID", c => c.Int());
            CreateIndex("dbo.Driver", "TruckID");
            AddForeignKey("dbo.Driver", "TruckID", "dbo.Truck", "TruckID");
        }
    }
}
