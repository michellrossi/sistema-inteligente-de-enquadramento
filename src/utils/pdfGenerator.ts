import { jsPDF } from 'jspdf';
import { FormData, ViabilityResult } from '../types';

export function generatePdf(formData: FormData, results: ViabilityResult[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = 10;

  // Header
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LEI Nº 16.402/2016", pageWidth / 2, y + 8, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("art. 136 - Nenhuma atividade não residencial - NR, poderá ser instalada sem prévia emissão, pela Prefeitura, da licença correspondente", pageWidth / 2, y + 16, { align: "center", maxWidth: pageWidth - 40 });
  y += 30;

  function drawRow(label: string, value: string) {
    const labelW = 45;
    const valX = margin + labelW + 2;
    const rowH = 7;
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y, labelW, rowH, 'F');
    doc.setFillColor(250, 250, 250);
    doc.rect(margin + labelW, y, pageWidth - (margin * 2) - labelW, rowH, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin + 2, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text((value || "").toString().substring(0, 90), valX, y + 4.5);
    y += rowH + 1;
  }

  // Section 1: Qualification
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. QUALIFICAÇÃO", margin + 2, y + 4);
  y += 8;

  drawRow("Nº Demanda/Processo", formData.demandaProcesso);
  drawRow("CNPJ", formData.cnpj);
  drawRow("Razão Social", formData.razaoSocial);
  drawRow("Fantasia", formData.nomeFantasia);
  drawRow("Nome Responsável", formData.nomeResponsavel);
  drawRow("CPF", formData.cpf);
  drawRow("Endereço Completo", formData.endereco);
  drawRow("Complemento", formData.complemento);
  drawRow("SQL (IPTU)", formData.sql);
  drawRow("Descrição das atividades", formData.descricaoExtra);
  y += 2;

  // Section 2: Enquadramento
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. ENQUADRAMENTO", margin + 2, y + 4);
  y += 8;

  drawRow("Edificação", formData.edificacao);
  drawRow("Área da Atividade", formData.areaAtividade + " m²");
  // Assuming these are stored in results or passed separately
  // For simplicity, we'll use the first result's context if available
  y += 4;

  // CNAEs consulted
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CNAEs e Grupos de Atividade consultados", margin + 2, y + 4);
  y += 8;

  doc.setTextColor(0);
  results.forEach(item => {
    if (y > 260) { doc.addPage(); y = 10; }
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, pageWidth - (margin * 2), 12, 'F');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`${item.cnae.cnae_codigo} - ${item.cnae.grupo_atividade}`, margin + 2, y + 4);
    doc.setFont("helvetica", "normal");
    doc.text(item.cnae.descricao.substring(0, 100), margin + 2, y + 9);
    y += 14;
  });

  y += 5;
  if (y > 240) { doc.addPage(); y = 10; }

  // Status
  const statusTxt = formData.statusLegal || "Não selecionado";
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(statusTxt, pageWidth - (margin * 2) - 4);
  const boxHeight = 12 + (lines.length * 5) + 5;
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, y, pageWidth - (margin * 2), boxHeight, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("STATUS DO ENQUADRAMENTO:", margin + 2, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(lines, margin + 2, y + 12);
  y += boxHeight + 20;

  // Signature
  doc.setLineWidth(0.5);
  doc.line(margin + 40, y, pageWidth - margin - 40, y);
  const func = formData.funcionario || "Responsável Técnico";
  const cargo = formData.cargo || "Cargo";
  const rf = formData.rf || "RF";
  const hoje = new Date().toLocaleDateString('pt-BR');

  doc.setFont("helvetica", "bold");
  doc.text(func, pageWidth / 2, y + 5, { align: 'center' });
  doc.setFont("helvetica", "normal");
  doc.text(`${cargo} - R.F. ${rf}`, pageWidth / 2, y + 10, { align: 'center' });
  doc.text(hoje, pageWidth / 2, y + 15, { align: 'center' });

  doc.save("Relatorio_Enquadramento.pdf");
}
