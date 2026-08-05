import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Interno, ApiResponse, CambioAceitePayload, NuevoInternoPayload } from '../types';

export function useInternos() {
  return useQuery<Interno[]>({
    queryKey: ['internos'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Interno[]>>('/internos');
      return response.data.data || [];
    },
    refetchInterval: 30000, // Revalidar automáticamente cada 30 segundos
  });
}

export function useRegistrarCambio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CambioAceitePayload) => {
      const formData = new FormData();
      formData.append('interno_id', payload.interno_id);
      formData.append('fecha_cambio', payload.fecha_cambio);
      formData.append('kilometraje', String(payload.kilometraje));
      formData.append('mecanicos', payload.mecanicos);
      if (payload.imagen_comprobante) {
        formData.append('imagen_comprobante', payload.imagen_comprobante);
      }

      const response = await api.post<ApiResponse>('/cambios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidar y recargar la caché de internos automáticamente
      queryClient.invalidateQueries({ queryKey: ['internos'] });
    },
  });
}

export function useAgregarInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NuevoInternoPayload) => {
      const formData = new FormData();
      formData.append('numero_interno', payload.numero_interno);
      formData.append('marca', payload.marca);
      if (payload.imagen) {
        formData.append('imagen', payload.imagen);
      }

      const response = await api.post<ApiResponse>('/internos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internos'] });
    },
  });
}

export function useEliminarInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse>(`/internos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internos'] });
    },
  });
}
