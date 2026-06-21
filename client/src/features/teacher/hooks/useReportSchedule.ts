/**
 * Report schedule hooks — React Query hooks for managing scheduled PDF report delivery.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsAPI } from "../../../services/api";

export interface ReportSubscription {
  id: string;
  class_id: string | null;
  frequency: string;
  day_of_week: number;
  day_of_month: number;
  is_active: boolean;
  last_sent_at: string | null;
  next_send_at: string | null;
  created_at: string;
}

export function useReportSubscriptions() {
  return useQuery<ReportSubscription[]>({
    queryKey: ["reports", "subscriptions"],
    queryFn: async () => {
      const res = await reportsAPI.getSubscriptions();
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      frequency: string;
      class_id?: string;
      day_of_week?: number;
      day_of_month?: number;
    }) => reportsAPI.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "subscriptions"] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsAPI.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "subscriptions"] });
    },
  });
}

export function useTriggerReport() {
  return useMutation({
    mutationFn: (classId?: string) => reportsAPI.triggerReport(classId),
  });
}
