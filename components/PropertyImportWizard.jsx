'use client';
import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';

const FIELD_DEFINITIONS = [
  { key: 'title', label: 'Título', required: true, aliases: ['title', 'titulo', 'título', 'nombre'] },
  { key: 'description', label: 'Descripción', required: false, aliases: ['description', 'descripcion', 'descripción', 'desc'] },
  { key: 'estado', label: 'Estado', required: true, aliases: ['estado', 'state'] },
  { key: 'ciudad', label: 'Ciudad', required: true, aliases: ['ciudad', 'city', 'delegacion', 'delegación', 'municipio'] },
  { key: 'colonia', label: 'Colonia', required: true, aliases: ['colonia', 'neighborhood', 'barrio', 'col'] },
  { key: 'codigoPostal', label: 'Código Postal', required: false, aliases: ['codigopostal', 'codigo postal', 'código postal', 'cp', 'zip'] },
  { key: 'propertyType', label: 'Tipo de propiedad', required: true, aliases: ['propertytype', 'tipo de propiedad', 'tipo', 'tipo_propiedad', 'type'] },
  { key: 'price', label: 'Precio (MXN)', required: false, aliases: ['price', 'precio', 'precio_mxn', 'costo'] },
  { key: 'monthlyRent', label: 'Renta mensual (MXN)', required: false, aliases: ['monthlyrent', 'renta', 'renta mensual', 'rent'] },
  { key: 'bedrooms', label: 'Recámaras', required: false, aliases: ['bedrooms', 'recamaras', 'recámaras', 'beds', 'cuartos'] },
  { key: 'bathrooms', label: 'Baños', required: false, aliases: ['bathrooms', 'banos', 'baños', 'baths'] },
  { key: 'squareMeters', label: 'M² construcción', required: false, aliases: ['squaremeters', 'metros', 'm2', 'm²', 'construccion', 'construcción', 'size', 'area', 'área'] },
  { key: 'lotSize', label: 'M² terreno', required: false, aliases: ['lotsize', 'terreno', 'lote', 'lot', 'terrain'] },
  { key: 'parkingSpaces', label: 'Estacionamiento', required: false, aliases: ['parkingspaces', 'estacionamiento', 'parking', 'cajones'] },
  { key: 'condition', label: 'Condición', required: false, aliases: ['condition', 'condicion', 'condición', 'estado_propiedad'] },
  { key: 'furnished', label: 'Amueblado', required: false, aliases: ['furnished', 'amueblado', 'amueblada'] },
  { key: 'status', label: 'Estatus', required: false, aliases: ['status', 'estatus', 'estado_venta'] },
  { key: 'address', label: 'Dirección', required: false, aliases: ['address', 'direccion', 'dirección', 'ubicacion', 'ubicación'] },
  { key: 'halfBaths', label: 'Medios baños', required: false, aliases: ['halfbaths', 'medios banos', 'medios baños'] },
  { key: 'floors', label: 'Pisos', required: false, aliases: ['floors', 'pisos', 'niveles', 'plantas'] },
  { key: 'yearBuilt', label: 'Año construcción', required: false, aliases: ['yearbuilt', 'ano', 'año', 'ano_construccion', 'año_construcción', 'year'] },
  { key: 'maintenanceFee', label: 'Mantenimiento (MXN)', required: false, aliases: ['maintenancefee', 'mantenimiento', 'cuota', 'hoa'] },
  { key: 'petFriendly', label: 'Acepta mascotas', required: false, aliases: ['petfriendly', 'mascotas', 'pets'] },
  { key: 'visibility', label: 'Visibilidad', required: false, aliases: ['visibility', 'visibilidad', 'publico', 'privado'] },
];

function autoDetectMapping(headers) {
  const normalized = headers.map(h => String(h || '').toLowerCase().replace(/[\s_\-\.]+/g, ''));
  const mapping = {};
  for (const field of FIELD_DEFINITIONS) {
    const idx = normalized.findIndex(h => field.aliases.some(a => h === a || h.includes(a)));
    if (idx >= 0) mapping[field.key] = idx;
  }
  return mapping;
}

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!data.length) { reject(new Error('El archivo está vacío')); return; }
        const headers = data[0].map(h => String(h || '').trim());
        const rows = data.slice(1).filter(r => r.some(c => c !== ''));
        resolve({ headers, rows });
      } catch (err) { reject(new Error('No se pudo leer el archivo. Asegúrate de que sea .xlsx, .xls o .csv')); }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

function applyMapping(headers, rows, mapping) {
  return rows.map((row, rowIdx) => {
    const obj = {};
    for (const [fieldKey, colIdx] of Object.entries(mapping)) {
      const val = String(row[colIdx] || '').trim();
      const field = FIELD_DEFINITIONS.find(f => f.key === fieldKey);
      if (field) {
        if (['price', 'monthlyRent', 'bedrooms', 'bathrooms', 'squareMeters', 'lotSize', 'parkingSpaces', 'halfBaths', 'floors', 'yearBuilt', 'maintenanceFee'].includes(fieldKey)) {
          obj[fieldKey] = val ? Number(val) : undefined;
        } else if (fieldKey === 'petFriendly') {
          obj[fieldKey] = ['si', 'sí', 'yes', 'true', '1', 'acepta'].includes(val.toLowerCase());
        } else if (fieldKey === 'visibility') {
          obj[fieldKey] = ['privado', 'private', 'privada'].includes(val.toLowerCase()) ? 'private' : 'public';
        } else {
          obj[fieldKey] = val || undefined;
        }
      }
    }
    obj._rowNumber = rowIdx + 2;
    return obj;
  });
}

export default function PropertyImportWizard({ onSubmit, onCancel }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileDrop = useCallback(async (e) => {
    const f = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!f) return;
    setError(null);
    setFile(f);
    try {
      const parsed = await parseFile(f);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      const detected = autoDetectMapping(parsed.headers);
      setMapping(detected);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const mappedRows = useMemo(() => {
    if (!rows.length || !Object.keys(mapping).length) return [];
    return applyMapping(headers, rows, mapping);
  }, [headers, rows, mapping]);

  const handleMappingChange = (fieldKey, headerIdx) => {
    setMapping(prev => {
      const next = { ...prev };
      if (headerIdx === 'ignore') {
        delete next[fieldKey];
      } else {
        next[fieldKey] = parseInt(headerIdx);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setResults(null);
    try {
      const res = await onSubmit(mappedRows);
      setResults(res);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Error al procesar la importación');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 4 && results) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Importación completada</h2>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center"><p className="text-3xl font-bold text-green-600">{results.created}</p><p className="text-sm text-neutral-500">Creadas</p></div>
            {results.updated > 0 && <div className="text-center"><p className="text-3xl font-bold text-blue-600">{results.updated}</p><p className="text-sm text-neutral-500">Actualizadas</p></div>}
            <div className="text-center"><p className="text-3xl font-bold text-red-600">{results.failed}</p><p className="text-sm text-neutral-500">Fallidas</p></div>
          </div>
        </div>
        {results.errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Errores</h3>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {results.errors.map((e, i) => <li key={i}><strong>{e.title}:</strong> {e.error}</li>)}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => { setStep(1); setResults(null); setFile(null); setHeaders([]); setRows([]); setMapping({}); }}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            Importar otro archivo
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 text-white text-sm font-medium">
            Ir a propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-clay-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
            }`}>{s}</span>
            <span className={`hidden sm:inline ${step >= s ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400'}`}>
              {s === 1 ? 'Subir archivo' : s === 2 ? 'Mapear columnas' : 'Revisar e importar'}
            </span>
            {s < 3 && <span className="flex-1 h-px bg-neutral-300 dark:bg-neutral-700" />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Sube tu archivo de propiedades</h2>
          <p className="text-sm text-neutral-500 mb-4">Formatos aceptados: .xlsx, .xls, .csv. La primera fila debe contener los encabezados de las columnas.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-12 cursor-pointer hover:border-clay-400 transition-colors">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Arrastra tu archivo aquí o haz clic para seleccionar</p>
            <p className="text-xs text-neutral-400">Máximo 500 propiedades por archivo</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileDrop} className="hidden" />
          </label>
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Mapea tus columnas</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Archivo: <strong>{file?.name}</strong> · {rows.length} propiedades detectadas.
            Asocia cada columna de tu Excel con el campo correcto.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {FIELD_DEFINITIONS.map(field => (
              <div key={field.key} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="w-40 shrink-0 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </span>
                <select
                  value={mapping[field.key] !== undefined ? mapping[field.key] : 'ignore'}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className={`flex-1 px-2 py-1.5 rounded border text-sm ${
                    mapping[field.key] !== undefined
                      ? 'border-clay-300 dark:border-clay-700 bg-clay-50 dark:bg-clay-900/10 text-clay-700'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-500'
                  }`}
                >
                  <option value="ignore">Ignorar</option>
                  {headers.map((h, idx) => (
                    <option key={idx} value={idx}>{h || `Columna ${idx + 1}`}</option>
                  ))}
                </select>
                {mapping[field.key] !== undefined && (
                  <span className="text-xs text-green-600 dark:text-green-400 shrink-0">✓</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
              Volver
            </button>
            <button onClick={() => setStep(3)} disabled={!Object.keys(mapping).length}
              className="flex-1 px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white text-sm font-medium">
              Continuar ({mappedRows.length} propiedades)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Revisa los datos antes de importar</h2>

          {mappedRows.length > 0 && (
            <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800">
                    {Object.keys(mapping).map(k => (
                      <th key={k} className="px-2 py-1.5 text-left font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {FIELD_DEFINITIONS.find(f => f.key === k)?.label || k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t border-neutral-100 dark:border-neutral-800">
                      {Object.keys(mapping).map(k => (
                        <td key={k} className="px-2 py-1 text-neutral-700 dark:text-neutral-300 whitespace-nowrap max-w-[150px] truncate">
                          {row[k] !== undefined && row[k] !== null ? String(row[k]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {mappedRows.length > 50 && (
                <p className="p-2 text-xs text-neutral-500 text-center">Mostrando 50 de {mappedRows.length} propiedades</p>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(2)} className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
              Volver
            </button>
            <button onClick={handleSubmit} disabled={processing || !mappedRows.length}
              className="flex-1 px-4 py-2 rounded-lg bg-clay-500 hover:bg-clay-600 disabled:opacity-50 text-white text-sm font-medium">
              {processing ? 'Importando...' : `Importar ${mappedRows.length} propiedades`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
