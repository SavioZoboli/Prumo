import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './database/data-source';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuarios/usuario.module';
import { AuthModule } from './auth/auth.module';
import { FornecedorModule } from './fornecedores/fornecedor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions,
    }),

    UsuarioModule,
    AuthModule,
    FornecedorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
