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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheatersController = void 0;
const common_1 = require("@nestjs/common");
const theaters_service_1 = require("./theaters.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TheatersController = class TheatersController {
    theatersService;
    constructor(theatersService) {
        this.theatersService = theatersService;
    }
    async create(createTheaterDto, req) {
        const data = await this.theatersService.create(createTheaterDto, req.user._id);
        return { success: true, data };
    }
    async findAll(active) {
        const data = await this.theatersService.findAll(active === 'true');
        return { success: true, count: data.length, data };
    }
    async findOne(id) {
        const data = await this.theatersService.findOne(id);
        return { success: true, data };
    }
    async update(id, updateTheaterDto) {
        const data = await this.theatersService.update(id, updateTheaterDto);
        return { success: true, data };
    }
    async remove(id) {
        await this.theatersService.hardDelete(id);
        return { success: true, message: 'Theater deleted successfully' };
    }
    async updateSeatConfig(id, seatConfig) {
        const data = await this.theatersService.updateSeatConfig(id, seatConfig);
        return { success: true, data };
    }
    async getTheaterForEvent(theaterId, eventId) {
        const data = await this.theatersService.getTheaterForEvent(theaterId, eventId);
        return { success: true, data };
    }
};
exports.TheatersController = TheatersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/seat-config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('seatConfig')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "updateSeatConfig", null);
__decorate([
    (0, common_1.Get)('event-layout/:theaterId/:eventId'),
    __param(0, (0, common_1.Param)('theaterId')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TheatersController.prototype, "getTheaterForEvent", null);
exports.TheatersController = TheatersController = __decorate([
    (0, common_1.Controller)('api/v1/theater'),
    __metadata("design:paramtypes", [theaters_service_1.TheatersService])
], TheatersController);
//# sourceMappingURL=theaters.controller.js.map