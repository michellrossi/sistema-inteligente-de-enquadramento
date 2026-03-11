import { Cnae, ZoningRule, RoadRule, ViabilityResult, ViabilityStatus } from '../types';

export function calculateViability(
  cnae: Cnae,
  zona: string,
  larguraVia: number,
  regrasZonas: ZoningRule[],
  regrasVias: RoadRule[]
): ViabilityResult {
  const grupo = cnae.grupo_atividade;

  // 1. Check Zoning Rule
  const regraZona = regrasZonas.find(r => r.SUBCAT_USO === grupo);
  let permitidoZona = false;
  if (regraZona && regraZona[zona]) {
    const val = regraZona[zona].toUpperCase();
    permitidoZona = val.includes("SIM") || val.includes("I");
  }

  // 2. Check Road Rule
  let permitidoVia = false;
  const gruposIsentos = ["nR1", "nR2", "Ind-1a", "Ind-1b"];
  const ehGrupoElegivel = gruposIsentos.some(g => grupo.startsWith(g));

  if (cnae.baixo_risco && ehGrupoElegivel) {
    permitidoVia = true;
  } else {
    const regraVia = regrasVias.find(r => r.SUBCATEGORIA_DE_USO === grupo);
    if (regraVia) {
      const minViaStr = regraVia.LARGURA_MINIMA_DE_VIA;
      if (minViaStr === "NA") {
        permitidoVia = true;
      } else {
        const minVia = parseFloat(minViaStr);
        permitidoVia = !isNaN(minVia) && larguraVia >= minVia;
      }
    }
  }

  // 3. Determine Status
  let status: ViabilityStatus = 'NAO_PERMITIDO_5';
  let reason = '';

  if (!permitidoZona) {
    status = 'NAO_PERMITIDO_5';
    reason = `Proibido na zona ${zona}.`;
  } else if (!permitidoVia) {
    status = 'PERMITIDO_10';
    reason = `Zona OK, mas largura da via (${larguraVia}m) insuficiente.`;
  } else {
    status = 'PERMITIDO_30';
    reason = 'Local totalmente compatível.';
  }

  return {
    cnae,
    status,
    reason,
    permitidoZona,
    permitidoVia
  };
}

export function getWorstCaseStatus(results: ViabilityResult[]): ViabilityStatus {
  if (results.some(r => r.status === 'NAO_PERMITIDO_5')) return 'NAO_PERMITIDO_5';
  if (results.some(r => r.status === 'PERMITIDO_10')) return 'PERMITIDO_10';
  return 'PERMITIDO_30';
}
