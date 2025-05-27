import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { SearchFilters, SearchResponse, LegalDocument, SourceInfo, GeminiApiResponse, GeminiJsonResult, Jurisdiction, LegalArea, DocumentType, ApplicableLegislation, RelatedCase, ExpandedDetails, GeminiExpandedJsonResult } from '../types';

// Ensure API_KEY is available in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in process.env.API_KEY. The application may not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_PLACEHOLDER" });
const geminiModelName = 'gemini-2.5-flash-preview-04-17';

const constructPrompt = (query: string, filters: SearchFilters): Content => {
  let filterDescription = `Jurisdicción principal: ${filters.jurisdiction}.`;
  if (filters.jurisdiction === Jurisdiction.ALL) {
    filterDescription = "Considera todas las jurisdicciones relevantes (Andorra, España, UE).";
  }

  if (filters.dateFrom && filters.dateTo) {
    filterDescription += ` Documentos entre ${filters.dateFrom} y ${filters.dateTo}.`;
  } else if (filters.dateFrom) {
    filterDescription += ` Documentos a partir de ${filters.dateFrom}.`;
  } else if (filters.dateTo) {
    filterDescription += ` Documentos hasta ${filters.dateTo}.`;
  }

  if (filters.legalArea && filters.legalArea !== LegalArea.ALL) {
    filterDescription += ` Área legal: ${filters.legalArea}.`;
  }
   if (filters.documentType && filters.documentType !== DocumentType.ALL) {
    filterDescription += ` Tipo de documento: ${filters.documentType}.`;
  }
  if (filters.court && filters.court.trim() !== "") {
    filterDescription += ` Tribunal/Órgano emisor: ${filters.court}.`;
  }

  const promptText = `Eres un asistente experto en bases de datos jurídicas, especializado en la jurisprudencia de Andorra, así como en legislación relevante de España y la Unión Europea que pueda ser aplicable o de interés para Andorra.

Dada la siguiente consulta: '${query}'
Y considerando los filtros: ${filterDescription}

Busca jurisprudencia y documentos legales relevantes. Utiliza la búsqueda en Google para encontrar información actualizada y relevante.

Formatea tu respuesta como un ÚNICO string JSON que contenga un objeto. Este objeto debe tener una clave 'results', cuyo valor sea un array de documentos.
Cada documento en el array 'results' debe ser un objeto con las siguientes claves obligatorias:
- 'id': un identificador único ficticio para este resultado (ej. 'AND-CIV-2023-001').
- 'title': un título conciso del documento.
- 'summary': un resumen breve del documento (2-5 frases).
- 'jurisdiction': la jurisdicción principal ('Andorra', 'España', 'UE', u otra relevante si es el caso).
- 'date': la fecha de la sentencia o documento (formato YYYY-MM-DD, si es aplicable, sino null o una string vacía).

Y las siguientes claves opcionales (inclúyelas SOLO SI encuentras información relevante y precisa):
- 'legalArea': el área legal principal del documento (ej. 'Civil', 'Penal').
- 'documentType': el tipo de documento (ej. 'Sentencia', 'Ley').
- 'court': el tribunal o órgano emisor.
- 'fullTextLink': un enlace URL al texto completo del documento si está disponible públicamente.
- 'keywords': un array de strings con palabras clave relevantes (ej. ["arrendamiento", "vivienda habitual", "obligaciones contractuales"]).
- 'applicableLegislation': un array de objetos, donde cada objeto representa legislación citada y tiene las claves 'name' (string, nombre de la ley/normativa), 'article' (string, opcional, artículo específico), y 'link' (string, opcional, URL a la legislación).
- 'relatedCases': un array de objetos, donde cada objeto representa un caso relacionado y tiene las claves 'id' (string, ID del caso relacionado), 'title' (string, título del caso), 'relationship' (string, ej. "Cita a", "Confirma", "Anula"), y 'link' (string, opcional, URL al caso).
- 'judgeMagistrate': string con el nombre del juez o magistrado ponente, si es identificable.
- 'parties': string describiendo las partes involucradas de forma genérica (ej. "Arrendador vs. Arrendatario", "Estado vs. Particular"). NO incluyas nombres propios de individuos.
- 'decisionOutcome': string resumiendo el fallo o la decisión principal (ej. "Favorable al demandante", "Recurso desestimado", "Acuerdo entre las partes").
- 'notes': string con observaciones adicionales o contexto importante que consideres relevante y no encaje en otros campos.
- 'extendedContent': (opcional) Un extracto más extenso del documento. Si el documento es una sentencia, podría incluir los principales fundamentos de derecho, argumentos clave de las partes y la parte dispositiva (fallo). Si es una ley, un resumen detallado de sus artículos más relevantes. Debería ser significativamente más detallado que el 'summary' pero no necesariamente el texto completo si es muy largo. Enfócate en la información más útil para un abogado.


Ejemplo de la estructura JSON esperada (DEBES devolver solo el string JSON, sin markdown code fences como \`\`\`json y sin explicaciones adicionales):
A continuación el JSON:
{
  "results": [
    {
      "id": "AND-CIV-2023-001",
      "title": "Sentencia del Tribunal Superior sobre contratos de alquiler",
      "summary": "El Tribunal Superior de Justicia de Andorra clarifica las obligaciones del arrendador en contratos de alquiler de vivienda habitual. Se analiza la Ley de Arrendamientos Urbanos y jurisprudencia previa.",
      "jurisdiction": "Andorra",
      "date": "2023-03-15",
      "legalArea": "Civil",
      "documentType": "Sentencia",
      "court": "Tribunal Superior de Justicia de Andorra",
      "fullTextLink": "https://www.example.com/sentencia/AND-CIV-2023-001.pdf",
      "keywords": ["contrato de alquiler", "vivienda habitual", "obligaciones arrendador", "TSJA"],
      "applicableLegislation": [
        {"name": "Llei 21/2019, del 12 de desembre, d'arrendaments de finques urbanes", "article": "Art. 15", "link": "https://www.bopa.ad/bopa/2019/30122019/Pagines/Llei-212019-del-12-de-desembre-darrendaments-de-finques-urbanes.aspx"}
      ],
      "relatedCases": [
        {"id": "AND-CIV-2020-087", "title": "Auto sobre cláusulas abusivas", "relationship": "Cita a", "link": "https://www.example.com/auto/AND-CIV-2020-087"}
      ],
      "judgeMagistrate": "Maria exemple Pérez",
      "parties": "Propietari Immoble SA vs. Llogater Particular",
      "decisionOutcome": "Parcialment favorable al demandant",
      "notes": "La sentencia tiene un voto particular relevante.",
      "extendedContent": "EXTRACTO EXTENSO DEL DOCUMENTO...\n\nFundamentos de Derecho:\n1. El artículo X de la Ley Y establece que...\n2. La jurisprudencia consolidada (Sentencia ZZZ/YYYY) indica que...\n\nArgumentos de las partes:\n- Parte demandante: Alegó incumplimiento contractual debido a...\n- Parte demandada: Sostuvo la correcta aplicación de la normativa vigente y...\n\nFallo (Parte Dispositiva):\nSE ACUERDA: Estimar parcialmente la demanda interpuesta por... Condenar a... Absolver a... con costas..."
    }
  ]
}

Si no encuentras resultados directos, devuelve un array 'results' vacío, así: {"results": []}.
No incluyas ninguna explicación antes o después del string JSON. Tu respuesta debe ser exclusivamente el JSON.`;
  
  return { parts: [{text: promptText}], role: 'user' };
};

export const searchLegalPrecedents = async (query: string, filters: SearchFilters): Promise<SearchResponse> => {
  if (!API_KEY) {
    throw new Error("La clave API de Gemini no está configurada. Por favor, configure la variable de entorno API_KEY.");
  }

  const contents: Content = constructPrompt(query, filters);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: geminiModelName,
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let documents: LegalDocument[] = [];
    const sources: SourceInfo[] = [];
    
    let jsonStr = response.text; 
    if (!jsonStr) {
        console.warn("Respuesta de Gemini vacía o sin texto.");
         return { 
            documents: [{
                id: `empty-response-${Date.now()}`,
                title: "Respuesta vacía de la IA",
                summary: "La IA no proporcionó texto en su respuesta. Intente reformular su consulta.",
                jurisdiction: "IA",
                date: new Date().toISOString().split('T')[0]
            }], 
            sources 
        };
    }
    
    jsonStr = jsonStr.trim();
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      const parsedData: GeminiApiResponse = JSON.parse(jsonStr);
      if (parsedData && parsedData.results && Array.isArray(parsedData.results)) {
        documents = parsedData.results.map((doc: GeminiJsonResult): LegalDocument => ({ 
          id: doc.id || `gen-${Math.random().toString(36).substring(2, 9)}`,
          title: doc.title || "Título no disponible",
          summary: doc.summary || "Resumen no disponible.",
          jurisdiction: doc.jurisdiction || "Jurisdicción no especificada",
          date: doc.date || null,
          legalArea: doc.legalArea || undefined,
          documentType: doc.documentType || undefined,
          court: doc.court || undefined,
          fullTextLink: doc.fullTextLink || undefined,
          keywords: doc.keywords || undefined,
          applicableLegislation: doc.applicableLegislation || undefined,
          relatedCases: doc.relatedCases || undefined,
          judgeMagistrate: doc.judgeMagistrate || undefined,
          parties: doc.parties || undefined,
          decisionOutcome: doc.decisionOutcome || undefined,
          notes: doc.notes || undefined,
          extendedContent: doc.extendedContent || undefined,
        }));
      } else {
        console.warn("Respuesta JSON de Gemini no tiene el formato esperado (results array):", parsedData);
         documents.push({
            id: `parsing-issue-${Date.now()}`,
            title: "Problema al interpretar respuesta de IA",
            summary: "La IA respondió, pero el formato no fue el esperado. Texto original (parcial): " + (response.text.length > 200 ? response.text.substring(0, 197) + "..." : response.text),
            jurisdiction: "IA",
            date: new Date().toISOString().split('T')[0]
         });
      }
    } catch (e) {
      console.error("Error al parsear JSON de la respuesta de Gemini:", e);
      console.error("Respuesta de texto cruda de Gemini:", response.text);
      if(response.text && documents.length === 0){
         documents.push({
            id: `fallback-parse-error-${Date.now()}`,
            title: "Respuesta general de la IA (error de formato)",
            summary: response.text.length > 500 ? response.text.substring(0, 497) + "..." : response.text,
            jurisdiction: "IA",
            date: new Date().toISOString().split('T')[0]
         });
      }
    }
    
    if (response.candidates && response.candidates[0] && response.candidates[0].groundingMetadata && response.candidates[0].groundingMetadata.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            uri: chunk.web.uri || "#",
            title: chunk.web.title || chunk.web.uri || "Fuente sin título",
          });
        }
      });
    }

    return { documents, sources };

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("La clave API de Gemini no es válida. Por favor, verifique su configuración.");
        }
        throw new Error(`Error de la API de Gemini: ${error.message}`);
    }
    throw new Error("Error desconocido al contactar la API de Gemini.");
  }
};

const constructExpandedDetailsPrompt = (document: LegalDocument): Content => {
  const { title, id, summary, extendedContent, jurisdiction } = document;
  let contextInfo = `Título del documento: "${title}" (ID: ${id}, Jurisdicción: ${jurisdiction}).`;
  if (summary) contextInfo += `\nResumen existente (parcial): "${summary.substring(0, 250)}..."`;
  if (extendedContent) contextInfo += `\nContenido extenso ya disponible (parcial): "${extendedContent.substring(0, 350)}..."`;

  const promptText = `Eres un experto analista jurídico con profundo conocimiento. Para el siguiente documento legal, del cual ya se posee información básica y un extracto relevante, se requiere una ampliación con mayor detalle y análisis.
Contexto del documento existente:
${contextInfo}

Por favor, genera información adicional y más profunda. NO repitas la información ya presente en el resumen o contenido extenso proporcionados en el contexto. Enfócate en:
1.  'longDescription': Proporciona una descripción mucho más extensa y pormenorizada del documento. Detalla aspectos cruciales no cubiertos o solo mencionados superficialmente en el 'extendedContent' previo. Si es una sentencia, puede incluir un análisis más profundo de los fundamentos de derecho, votos particulares (si los hay y son relevantes), o la argumentación detallada de las partes. Si es una ley, podría ser un desglose más minucioso de artículos clave y sus interrelaciones. Esta descripción debe ser sustancial y aportar nueva información o mayor granularidad.
2.  'detailedAnalysis': Ofrece un análisis experto y profundo. Esto puede incluir:
    *   Implicaciones legales más amplias de la decisión o normativa.
    *   Contexto histórico o social relevante que influyó en el documento o su interpretación.
    *   Comparativas con jurisprudencia similar (nacional o internacional relevante para Andorra, como España o UE).
    *   Posibles interpretaciones alternativas o debates doctrinales que suscita.
    *   Observaciones expertas sobre la trascendencia o impacto futuro del documento.
    *   Puntos fuertes o débiles en la argumentación (si es una sentencia).

Formatea tu respuesta como un ÚNICO string JSON que contenga un objeto con las claves 'longDescription' y 'detailedAnalysis'.
Ejemplo de la estructura JSON esperada (DEBES devolver solo el string JSON, sin markdown code fences como \`\`\`json y sin explicaciones adicionales):
A continuación el JSON:
{
  "longDescription": "DESCRIPCIÓN MUY EXTENSA Y DETALLADA DEL DOCUMENTO, CUBRIENDO NUEVOS ASPECTOS, PROFUNDIZANDO EN SECCIONES ESPECÍFICAS NO TRATADAS ANTERIORMENTE...",
  "detailedAnalysis": "ANÁLISIS EXPERTO PROFUNDO: IMPLICACIONES LEGALES SIGNIFICATIVAS..., CONTEXTO HISTÓRICO RELEVANTE..., COMPARATIVA CON CASO X Y LEY Y..., POSIBLES INTERPRETACIONES DIVERGENTES..."
}

Si no puedes generar información sustancial para alguna de las claves, puedes devolver un string vacío para esa clave. Tu respuesta debe ser exclusivamente el JSON.`;
  return { parts: [{ text: promptText }], role: 'user' };
};

export const fetchExpandedDocumentDetails = async (document: LegalDocument): Promise<ExpandedDetails> => {
  if (!API_KEY) {
    throw new Error("La clave API de Gemini no está configurada. Por favor, configure la variable de entorno API_KEY.");
  }
  const contents = constructExpandedDetailsPrompt(document);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: geminiModelName,
      contents: contents,
      config: {
         responseMimeType: "application/json", // Pide a Gemini que devuelva JSON directamente.
      }
    });

    let jsonStr = response.text.trim();
    // Aunque se pida JSON, a veces Gemini puede envolverlo en markdown.
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      const parsedData: GeminiExpandedJsonResult = JSON.parse(jsonStr);
      return {
        longDescription: parsedData.longDescription || undefined,
        detailedAnalysis: parsedData.detailedAnalysis || undefined,
      };
    } catch (e) {
      console.error("Error al parsear JSON de detalles expandidos:", e);
      console.error("Respuesta de texto cruda para detalles expandidos:", jsonStr);
      throw new Error("Error al interpretar la respuesta de la IA para los detalles ampliados. El formato recibido no fue el esperado.");
    }
  } catch (error) {
    console.error("Error al llamar a la API de Gemini para detalles expandidos:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("La clave API de Gemini no es válida. Por favor, verifique su configuración.");
        }
        throw new Error(`Error de la API de Gemini al obtener detalles ampliados: ${error.message}`);
    }
    throw new Error("Error desconocido al contactar la API de Gemini para obtener detalles ampliados.");
  }
};