export interface Category { id:string;slug:string;name:string }
export interface ProductImage { url:string;alt:string;width:number;height:number }
export interface AffiliateOffer { id:string;marketplace:'mercado_livre';affiliateUrl:string }
export interface ProductCard { id:string;slug:string;name:string;shortDescription:string;image:ProductImage;categories:Category[];offer:AffiliateOffer;sortOrder:number;featuredRank:number|null;dailyPickDate:string|null;dailyPickRank:number }
export type Product=ProductCard;
export interface CatalogSnapshot { products:ProductCard[];categories:Category[];whatsapp:{enabled:boolean;url:string|null};generatedAt:string }
