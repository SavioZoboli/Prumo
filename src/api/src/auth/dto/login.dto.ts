import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'leticiaz' })
  usuario!: string;

  @ApiProperty({ example: '123456' })
  senha!: string;
}