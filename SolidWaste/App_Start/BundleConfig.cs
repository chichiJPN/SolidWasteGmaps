﻿using System.Web;
using System.Web.Optimization;

namespace SolidWaste
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = false;


            bundles.Add(new Bundle("~/bundles/jquery-3.1.1").Include("~/Scripts/jquery-3.1.1.js"));
            bundles.Add(new Bundle("~/bundles/jquery-2.2.4").Include("~/Scripts/jquery-2.2.4.js"));
            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new Bundle("~/bundles/main").Include("~/Scripts/main.js"));
            bundles.Add(new Bundle("~/bundles/bootstrap").Include("~/Scripts/bootstrap.js"));
            bundles.Add(new Bundle("~/bundles/owlcarousel").Include("~/Scripts/owl.carousel.js"));
            bundles.Add(new Bundle("~/bundles/arcgis").Include("~/Scripts/arcgis.js"));


            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/cssBundle").Include(
                        "~/Content/bootstrap/css/bootstrap.css",
                        "~/Content/owlcarousel/owl.carousel.css",
                        "~/Content/owlcarousel/owl.theme.default.css",
                        "~/Content/styles.css"
                        ));


            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));
        }
    }
}