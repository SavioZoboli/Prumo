import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FornecedorService } from './fornecedor.service';
import { FornecedorController } from './fornecedor.controller';
import { Fornecedor } from './fornecedor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Fornecedor])],
    controllers: [FornecedorController],
    providers: [FornecedorService],
})

export class FornecedorModule {}