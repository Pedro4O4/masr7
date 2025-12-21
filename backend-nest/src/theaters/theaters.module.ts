import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TheatersService } from './theaters.service';
import { TheatersController } from './theaters.controller';
import { Theater, TheaterSchema } from './schemas/theater.schema';
import { Event, EventSchema } from '../events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Theater.name, schema: TheaterSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  providers: [TheatersService],
  controllers: [TheatersController],
  exports: [TheatersService],
})
export class TheatersModule { }
