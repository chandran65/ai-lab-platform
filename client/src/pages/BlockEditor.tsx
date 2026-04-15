import { useState } from "react";
import { execAPI, transpilerAPI } from "../services/api";
import { Code, Play, FileCode, Copy, RotateCcw } from "lucide-react";

const SAMPLE_BLOCKS = `{
  "blocks": [
    { "type": "load_data", "params": { "source": "dataset", "name": "my_images" } },
    { "type": "preprocess", "params": { "resize": [224, 224], "normalize": true } },
    { "type": "create_model", "params": { "type": "cnn", "layers": 3 } },
    { "type": "train", "params": { "epochs": 10, "learning_rate": 0.001 } },
    { "type": "evaluate", "params": { "metrics": ["accuracy", "loss"] } }
  ]
}`;

export default function BlockEditor() {
  const [blockCode, setBlockCode] = useState(SAMPLE_BLOCKS);
  const [generatedCode, setGeneratedCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [running, setRunning] = useState(false);
  const [transpiling, setTranspiling] = useState(false);

  const handleTranspile = async () => {
    setTranspiling(true);
    try {
      const parsed = JSON.parse(blockCode);
      const res = language === "python"
        ? await transpilerAPI.toPython(parsed)
        : await transpilerAPI.toJavaScript(parsed);
      setGeneratedCode(res.data.code);
    } catch (err: unknown) {
      const msg = err instanceof SyntaxError ? "Invalid JSON" : "Transpilation failed";
      setGeneratedCode(`# Error: ${msg}`);
    } finally {
      setTranspiling(false);
    }
  };

  const handleRun = async () => {
    if (!generatedCode) return;
    setRunning(true);
    setOutput("");
    try {
      const res = await execAPI.run({ code: generatedCode, language, timeout: 10 });
      setOutput(res.data.output || res.data.error || "No output");
    } catch {
      setOutput("Execution failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Code className="h-7 w-7 text-indigo-600" />
          Block Coding Editor
        </h1>
        <p className="text-slate-500 mt-1">Build AI pipelines with visual blocks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Block Definition (JSON)</h2>
            <button
              onClick={() => setBlockCode(SAMPLE_BLOCKS)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <textarea
            value={blockCode}
            onChange={(e) => setBlockCode(e.target.value)}
            className="w-full h-80 px-4 py-3 bg-slate-900 text-green-400 font-mono text-sm rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            spellCheck={false}
          />
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "python" | "javascript")}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button
              onClick={handleTranspile}
              disabled={transpiling}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              <FileCode className="h-4 w-4" />
              {transpiling ? "Converting..." : "Convert to Code"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Generated Code</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                disabled={!generatedCode}
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <button
                onClick={handleRun}
                disabled={running || !generatedCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                {running ? "Running..." : "Run"}
              </button>
            </div>
          </div>
          <pre className="w-full h-52 px-4 py-3 bg-slate-900 text-blue-300 font-mono text-sm rounded-xl border border-slate-700 overflow-auto whitespace-pre-wrap">
            {generatedCode || "// Click 'Convert to Code' to generate code from blocks"}
          </pre>

          <h2 className="text-sm font-semibold text-slate-700">Output</h2>
          <pre className="w-full h-24 px-4 py-3 bg-slate-50 text-slate-800 font-mono text-sm rounded-xl border border-slate-200 overflow-auto whitespace-pre-wrap">
            {output || "Run the code to see output here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
