import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material } from './material.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Material])],
    controllers: [MaterialController],
    providers: [MaterialService],
})

export class MaterialModule {}