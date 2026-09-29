import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface MaterialRelatorio {
  codigo: string;
  nome: string;
  equipamento: string;
  fabricante: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
}

@Component({
  selector: 'app-relatorio-materiais-minimo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './relatorio-materiais-minimo.html',
  styleUrl: './relatorio-materiais-minimo.scss',
})
export class RelatorioMateriaisMinimo {
  colunasExibidas = [
    'codigo',
    'nome',
    'equipamento',
    'fabricante',
    'estoqueAtual',
    'estoqueMinimo',
    'status',
  ];

  // Mock temporário enquanto a integração com o backend de materiais não está disponível.
  materiais: MaterialRelatorio[] = [
    {
      codigo: 'CNMG120408',
      nome: 'Inserto de torneamento',
      equipamento: 'Torno CNC',
      fabricante: 'Sandvik',
      unidadeMedida: 'UN',
      estoqueAtual: 5,
      estoqueMinimo: 10,
      ativo: true,
    },
    {
      codigo: 'FRESA010',
      nome: 'Fresa de topo',
      equipamento: 'Centro de usinagem',
      fabricante: 'Seco',
      unidadeMedida: 'UN',
      estoqueAtual: 10,
      estoqueMinimo: 10,
      ativo: true,
    },
    {
      codigo: 'BROCA008',
      nome: 'Broca 8 mm',
      equipamento: 'Furadeira',
      fabricante: 'Walter',
      unidadeMedida: 'UN',
      estoqueAtual: 18,
      estoqueMinimo: 8,
      ativo: true,
    },
    {
      codigo: 'PAST004',
      nome: 'Pastilha de corte',
      equipamento: 'Torno CNC',
      fabricante: 'Kennametal',
      unidadeMedida: 'UN',
      estoqueAtual: 2,
      estoqueMinimo: 6,
      ativo: true,
    },
  ];

  get materiaisAbaixoDoMinimo(): MaterialRelatorio[] {
    return this.materiais.filter(
      (material) =>
        material.ativo &&
        material.estoqueAtual <= material.estoqueMinimo
    );
  }

  get totalCriticos(): number {
    return this.materiaisAbaixoDoMinimo.length;
  }
}