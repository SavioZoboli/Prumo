import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { Usuario } from "./usuario.entity";
import { UsuarioService } from "./usuario.service";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @ApiOperation({ summary: 'Criar um novo usuário' })
@ApiResponse({
  status: 201,
  description: 'Usuário criado com sucesso.',
  type: Usuario,
})
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Body() createUsuarioDto: CreateUsuarioDto,
): Promise<Usuario> {
  return this.usuarioService.create(createUsuarioDto);
}

 @ApiOperation({ summary: 'Listar usuários ativos' })
@ApiResponse({
  status: 200,
  description: 'Lista de usuários ativos.',
  type: [Usuario],
})
@Get()
@UseGuards(JwtAuthGuard)
findAll() {
  return this.usuarioService.findAll();
}

 @ApiOperation({ summary: 'Buscar usuário por ID' })
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do usuário',
})
@ApiResponse({
  status: 200,
  description: 'Usuário encontrado.',
  type: Usuario,
})
@ApiResponse({
  status: 404,
  description: 'Usuário não encontrado.',
})
@Get(':id')
@UseGuards(JwtAuthGuard)
findOne(@Param('id') id: number) {
  return this.usuarioService.findOne(id);
}

  @ApiOperation({ summary: 'Atualizar um usuário' })
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do usuário',
})
@ApiResponse({
  status: 200,
  description: 'Usuário atualizado com sucesso.',
  type: Usuario,
})
@ApiResponse({
  status: 404,
  description: 'Usuário não encontrado.',
})
@Patch(':id')
@UseGuards(JwtAuthGuard)
update(
  @Param('id') id: number,
  @Body() updateUsuarioDto: UpdateUsuarioDto,
) {
  return this.usuarioService.update(id, updateUsuarioDto);
}

 @ApiOperation({
  summary: 'Desativar um usuário',
  description: 'Realiza uma exclusão lógica, alterando o campo ativo para false.',
})
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do usuário',
})
@ApiResponse({
  status: 200,
  description: 'Usuário desativado com sucesso.',
  schema: {
    example: {
      id: 1,
      nome: 'Letícia',
      sobrenome: 'Zalasik',
      email: 'leticia@email.com',
      usuario: 'leticiaz',
      senha: '123456',
      perfil: 'USER',
      ativo: false,
    },
  },
})
@Delete(':id')
@UseGuards(JwtAuthGuard)
remove(@Param('id') id: number) {
  return this.usuarioService.desativar(id);
}
}