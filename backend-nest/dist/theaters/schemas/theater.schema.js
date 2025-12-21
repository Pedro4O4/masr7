"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheaterSchema = exports.Theater = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Stage = class Stage {
    position;
    width;
    height;
};
__decorate([
    (0, mongoose_1.Prop)({ enum: ['top', 'bottom', 'left', 'right'], default: 'top' }),
    __metadata("design:type", String)
], Stage.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 80, min: 20, max: 100 }),
    __metadata("design:type", Number)
], Stage.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 15, min: 5, max: 40 }),
    __metadata("design:type", Number)
], Stage.prototype, "height", void 0);
Stage = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Stage);
let FloorInfo = class FloorInfo {
    rows;
    seatsPerRow;
    aislePositions;
    rowLabels;
};
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], FloorInfo.prototype, "rows", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], FloorInfo.prototype, "seatsPerRow", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], default: [] }),
    __metadata("design:type", Array)
], FloorInfo.prototype, "aislePositions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], FloorInfo.prototype, "rowLabels", void 0);
FloorInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], FloorInfo);
let TheaterLayout = class TheaterLayout {
    stage;
    mainFloor;
    hasBalcony;
    balcony;
    removedSeats;
    disabledSeats;
    hCorridors;
    vCorridors;
    seatCategories;
    labels;
};
__decorate([
    (0, mongoose_1.Prop)({ type: Stage, default: () => ({}) }),
    __metadata("design:type", Stage)
], TheaterLayout.prototype, "stage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: FloorInfo, default: () => ({}) }),
    __metadata("design:type", FloorInfo)
], TheaterLayout.prototype, "mainFloor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TheaterLayout.prototype, "hasBalcony", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: FloorInfo, default: null }),
    __metadata("design:type", FloorInfo)
], TheaterLayout.prototype, "balcony", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TheaterLayout.prototype, "removedSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TheaterLayout.prototype, "disabledSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} }),
    __metadata("design:type", Object)
], TheaterLayout.prototype, "hCorridors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} }),
    __metadata("design:type", Object)
], TheaterLayout.prototype, "vCorridors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} }),
    __metadata("design:type", Object)
], TheaterLayout.prototype, "seatCategories", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Schema.Types.Mixed],
        default: [],
    }),
    __metadata("design:type", Array)
], TheaterLayout.prototype, "labels", void 0);
TheaterLayout = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TheaterLayout);
let SeatConfig = class SeatConfig {
    row;
    seatNumber;
    seatType;
    section;
    isActive;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SeatConfig.prototype, "row", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SeatConfig.prototype, "seatNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['standard', 'vip', 'premium', 'wheelchair', 'disabled'],
        default: 'standard',
    }),
    __metadata("design:type", String)
], SeatConfig.prototype, "seatType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['main', 'balcony'], default: 'main' }),
    __metadata("design:type", String)
], SeatConfig.prototype, "section", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], SeatConfig.prototype, "isActive", void 0);
SeatConfig = __decorate([
    (0, mongoose_1.Schema)()
], SeatConfig);
let Theater = class Theater {
    name;
    description;
    createdBy;
    layout;
    seatConfig;
    totalSeats;
    vipSeats;
    premiumSeats;
    isActive;
    image;
};
exports.Theater = Theater;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Theater.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Theater.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], Theater.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: TheaterLayout, required: true }),
    __metadata("design:type", TheaterLayout)
], Theater.prototype, "layout", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SeatConfig] }),
    __metadata("design:type", Array)
], Theater.prototype, "seatConfig", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Theater.prototype, "totalSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Theater.prototype, "vipSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Theater.prototype, "premiumSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Theater.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Theater.prototype, "image", void 0);
exports.Theater = Theater = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Theater);
exports.TheaterSchema = mongoose_1.SchemaFactory.createForClass(Theater);
exports.TheaterSchema.pre('save', async function () {
    const mainFloor = this.layout?.mainFloor;
    const balcony = this.layout?.balcony;
    const mainSeats = (mainFloor?.rows || 0) * (mainFloor?.seatsPerRow || 0);
    const balconySeats = (this.layout?.hasBalcony)
        ? (balcony?.rows || 0) * (balcony?.seatsPerRow || 0)
        : 0;
    const seatConfigs = this.seatConfig || [];
    const disabledCount = seatConfigs.filter((s) => !s.isActive || s.seatType === 'disabled').length;
    this.totalSeats = Math.max(0, mainSeats + balconySeats - disabledCount);
    this.vipSeats = seatConfigs.filter((s) => s.seatType === 'vip' && s.isActive).length;
    this.premiumSeats = seatConfigs.filter((s) => s.seatType === 'premium' && s.isActive).length;
});
exports.TheaterSchema.methods.generateRowLabels = function (count, prefix = '') {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i < 26) {
            labels.push(prefix + String.fromCharCode(65 + i));
        }
        else {
            labels.push(prefix + 'R' + (i + 1));
        }
    }
    return labels;
};
exports.TheaterSchema.virtual('formattedCapacity').get(function () {
    const parts = [`${this.totalSeats} total`];
    if (this.vipSeats > 0)
        parts.push(`${this.vipSeats} VIP`);
    if (this.premiumSeats > 0)
        parts.push(`${this.premiumSeats} Premium`);
    return parts.join(', ');
});
//# sourceMappingURL=theater.schema.js.map