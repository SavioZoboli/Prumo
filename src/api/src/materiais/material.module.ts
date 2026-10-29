import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material } from './material.entity';
import { AlertaEstoqueModule } from '../alertas/alerta-estoque.module';

@Module({
    imports: [TypeOrmModule.forFeature([Material]), AlertaEstoqueModule],
    controllers: [MaterialController],
    providers: [MaterialService],
})

export class MaterialModule {}