import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { TheatersService } from './theaters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/theater')
export class TheatersController {
    constructor(private readonly theatersService: TheatersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTheaterDto: any, @Req() req: any) {
        const data = await this.theatersService.create(createTheaterDto, req.user._id);
        return { success: true, data };
    }

    @Get()
    async findAll(@Query('active') active: string) {
        const data = await this.theatersService.findAll(active === 'true');
        return { success: true, count: data.length, data };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.theatersService.findOne(id);
        return { success: true, data };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateTheaterDto: any) {
        const data = await this.theatersService.update(id, updateTheaterDto);
        return { success: true, data };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        await this.theatersService.hardDelete(id);
        return { success: true, message: 'Theater deleted successfully' };
    }

    @Put(':id/seat-config')
    @UseGuards(JwtAuthGuard)
    async updateSeatConfig(
        @Param('id') id: string,
        @Body('seatConfig') seatConfig: any[],
    ) {
        const data = await this.theatersService.updateSeatConfig(id, seatConfig);
        return { success: true, data };
    }

    @Get('event-layout/:theaterId/:eventId')
    async getTheaterForEvent(
        @Param('theaterId') theaterId: string,
        @Param('eventId') eventId: string,
    ) {
        const data = await this.theatersService.getTheaterForEvent(theaterId, eventId);
        return { success: true, data };
    }
}
