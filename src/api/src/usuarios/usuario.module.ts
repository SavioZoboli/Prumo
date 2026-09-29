import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { LogPerfil } from './log-perfil.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { LogPerfilService } from './log-perfil.service';
import { LogPerfilController } from './log-perfil.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, LogPerfil])],
    controllers: [UsuarioController, LogPerfilController],
    providers: [UsuarioService, LogPerfilService],
    exports: [UsuarioService],
})

export class UsuarioModule {}