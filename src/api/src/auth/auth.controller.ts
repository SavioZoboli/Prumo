import { Body, Controller, Post, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Autenticar usuário'  })
 @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso.',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário ou senha inválidos.',
  })

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Encerrar sessão',
    description: 'Revoga todos os tokens já emitidos para o usuário autenticado (não só o desta requisição).',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Sessão encerrada com sucesso.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request): Promise<void> {
    const usuarioId = (req as any).user.id;
    await this.authService.logout(usuarioId);
  }
}
