export interface Interno {
  id: string;
  numero_interno: string;
  marca: string;
  imagen_url?: string | null;
  creado_en?: string;
  ultimo_cambio_fecha?: string | null;
  ultimo_kilometraje?: number | null;
  ultimo_mecanicos?: string | null;
}

export interface CambioAceitePayload {
  interno_id: string;
  fecha_cambio: string;
  kilometraje: number;
  mecanicos: string;
  imagen_comprobante?: File | null;
}

export interface NuevoInternoPayload {
  numero_interno: string;
  marca: string;
  imagen?: File | null;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  total?: number;
  token?: string;
  usuario?: Usuario;
}
