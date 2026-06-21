import { motion } from "framer-motion";
import { ScrollText, Loader2, AlertCircle, Download, Award, Globe, GraduationCap } from "lucide-react";
import { useCertificates, useDownloadCertificate } from "../features/certificates/hooks/useCertificates";

const TYPE_META: Record<string, { label: string; icon: typeof Award; color: string; bg: string }> = {
  world: { label: "World Completion", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
  skill: { label: "Skill Mastery", icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
  course: { label: "Course Completion", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
};

export default function Certificates() {
  const { data: certificates, isLoading, isError, refetch } = useCertificates();
  const downloadMutation = useDownloadCertificate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-bold text-red-500">Failed to load certificates</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center">
          <ScrollText className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Certificates</h1>
          <p className="text-sm font-medium text-slate-500">Earn certificates by completing worlds, mastering skills, and finishing courses.</p>
        </div>
        <span className="ml-auto text-xs font-bold text-slate-400">
          {certificates?.length ?? 0} certificate{(certificates?.length ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {!certificates || certificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <ScrollText className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-lg font-black text-slate-400">No certificates yet</p>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            Complete learning worlds, master skills, or finish the entire course to earn certificates.
            Each certificate is a verified record of your achievement.
          </p>
          <div className="flex gap-3 mt-2">
            {[
              { icon: Globe, label: "Complete a World", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Award, label: "Master a Skill", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: GraduationCap, label: "Finish Course", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${item.bg} text-xs font-bold ${item.color}`}>
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Certificate list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert, i) => {
            const meta = TYPE_META[cert.certificate_type] ?? { label: cert.certificate_type, icon: Award, color: "text-slate-600", bg: "bg-slate-50" };
            const Icon = meta.icon;
            const isDownloading = downloadMutation.isPending && downloadMutation.variables === cert.id;

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Top gradient bar */}
                <div className={`h-2 ${
                  cert.certificate_type === "world" ? "bg-gradient-to-r from-emerald-400 to-teal-400" :
                  cert.certificate_type === "skill" ? "bg-gradient-to-r from-indigo-400 to-purple-400" :
                  "bg-gradient-to-r from-amber-400 to-orange-400"
                }`} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{meta.label}</p>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">{cert.title}</h3>
                      </div>
                    </div>
                    {/* Verified badge */}
                    {cert.is_verified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2">{cert.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400">
                      Issued {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}
                    </span>
                    <button
                      onClick={() => downloadMutation.mutate(cert.id)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white text-[10px] font-bold rounded-lg transition-all"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
