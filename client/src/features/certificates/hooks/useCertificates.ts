/** React Query hooks for certificate management. */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificatesAPI } from "../../../services/api";

export interface Certificate {
  id: string;
  certificate_type: string; // "world" | "skill" | "course"
  title: string;
  description: string;
  reference_id: string;
  issued_at: string;
  is_verified: boolean;
}

export function useCertificates() {
  return useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const res = await certificatesAPI.list();
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificate(id: string | null) {
  return useQuery<Certificate>({
    queryKey: ["certificates", id],
    queryFn: async () => {
      const res = await certificatesAPI.get(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: async (certificateId: string) => {
      const res = await certificatesAPI.download(certificateId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindora-certificate-${certificateId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useGenerateWorldCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (worldId: string) => {
      const res = await certificatesAPI.generateWorld(worldId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

export function useGenerateSkillCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ skillId, score }: { skillId: string; score: number }) => {
      const res = await certificatesAPI.generateSkill(skillId, score);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

export function useGenerateCourseCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (completedWorlds: string[]) => {
      const res = await certificatesAPI.generateCourse(completedWorlds);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}
