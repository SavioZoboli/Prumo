import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricanteService } from './fabricante.service';
import { FabricanteController } from './fabricante.controller';
import { Fabricante } from './fabricante.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Fabricante])],
    controllers: [FabricanteController],
    providers: [FabricanteService],
})

export class FabricanteModule {}
