"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_NAME = exports.ProductSizeLabel = exports.IntentType = exports.OfferType = exports.VerificationStatus = exports.UserRole = void 0;
exports.buildWhatsAppUrl = buildWhatsAppUrl;
exports.buildDirectionsUrl = buildDirectionsUrl;
exports.buildTelUrl = buildTelUrl;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["RETAILER"] = "retailer";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["APPROVED"] = "approved";
    VerificationStatus["REJECTED"] = "rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var OfferType;
(function (OfferType) {
    OfferType["FLAT"] = "flat";
    OfferType["PERCENT"] = "percent";
    OfferType["BOGO"] = "bogo";
})(OfferType || (exports.OfferType = OfferType = {}));
var IntentType;
(function (IntentType) {
    IntentType["CALL"] = "call";
    IntentType["WHATSAPP"] = "whatsapp";
    IntentType["DIRECTIONS"] = "directions";
})(IntentType || (exports.IntentType = IntentType = {}));
var ProductSizeLabel;
(function (ProductSizeLabel) {
    ProductSizeLabel["XS"] = "XS";
    ProductSizeLabel["S"] = "S";
    ProductSizeLabel["M"] = "M";
    ProductSizeLabel["L"] = "L";
    ProductSizeLabel["XL"] = "XL";
    ProductSizeLabel["XXL"] = "XXL";
    ProductSizeLabel["FREE"] = "FREE";
})(ProductSizeLabel || (exports.ProductSizeLabel = ProductSizeLabel = {}));
exports.PLATFORM_NAME = 'LocalFashion';
function buildWhatsAppUrl(phone, productTitle, storeName) {
    const message = encodeURIComponent(`Hi, I saw "${productTitle}" at ${storeName} on ${exports.PLATFORM_NAME} — is it available?`);
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
}
function buildDirectionsUrl(latitude, longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
function buildTelUrl(phone) {
    return `tel:${phone}`;
}
//# sourceMappingURL=index.js.map