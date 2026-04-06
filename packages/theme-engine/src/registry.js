"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionRegistry = void 0;
const schema_1 = require("./sections/announcement_bar/schema");
const schema_2 = require("./sections/featured_products/schema");
const schema_3 = require("./sections/hero/schema");
const schema_4 = require("./sections/categories_grid/schema");
const schema_5 = require("./sections/promo_banner/schema");
const schema_6 = require("./sections/new_arrivals/schema");
const schema_7 = require("./sections/trust_badges/schema");
const schema_8 = require("./sections/testimonials/schema");
const schema_9 = require("./sections/newsletter/schema");
const schema_10 = require("./sections/image_with_text/schema");
const schema_11 = require("./sections/header/schema");
const schema_12 = require("./sections/footer/schema");
exports.SectionRegistry = {
    [schema_1.AnnouncementBarSchema.type]: schema_1.AnnouncementBarSchema,
    [schema_2.FeaturedProductsSchema.type]: schema_2.FeaturedProductsSchema,
    [schema_3.HeroSchema.type]: schema_3.HeroSchema,
    [schema_4.CategoriesGridSchema.type]: schema_4.CategoriesGridSchema,
    [schema_5.PromoBannerSchema.type]: schema_5.PromoBannerSchema,
    [schema_6.NewArrivalsSchema.type]: schema_6.NewArrivalsSchema,
    [schema_7.TrustBadgesSchema.type]: schema_7.TrustBadgesSchema,
    [schema_8.TestimonialsSchema.type]: schema_8.TestimonialsSchema,
    [schema_9.NewsletterSchema.type]: schema_9.NewsletterSchema,
    [schema_10.ImageWithTextSchema.type]: schema_10.ImageWithTextSchema,
    [schema_11.HeaderSchema.type]: schema_11.HeaderSchema,
    [schema_12.FooterSchema.type]: schema_12.FooterSchema,
};
