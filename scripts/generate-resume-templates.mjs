import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const palettesPath = path.join(root, "app/data/resume-templates/palettes.json");
const variantsPath = path.join(root, "app/data/resume-templates/base-variants.json");
const outputPath = path.join(root, "app/data/resume-templates/generated-90.json");

const palettes = JSON.parse(await readFile(palettesPath, "utf-8"));
const variants = JSON.parse(await readFile(variantsPath, "utf-8"));

const templates = [];
let n = 1;

for (const variant of variants) {
  for (const palette of palettes) {
    templates.push({
      id: `tpl-${String(n).padStart(3, "0")}`,
      name: `${variant.key}-${palette.name}`,
      version: 1,
      layout: variant.layout,
      structure: variant.structure,
      sections: variant.sections,
      theme: {
        palette: {
          primary: palette.primary,
          secondary: palette.secondary,
          text: palette.text,
          muted: palette.muted,
          pageBackground: palette.pageBackground
        },
        line: variant.line,
        density: variant.density,
        textStyle: variant.textStyle,
        showIcon: variant.showIcon
      },
      aside: {
        width: "240px",
        height: "100%"
      },
      photo: {
        position: variant.photo?.position ?? "left",
        size: variant.photo?.size ?? "96px",
        shape: variant.photo?.shape ?? "circle",
        border: `2px solid ${palette.primary}`
      },
      decor: {
        corners: [
          {
            shape: "circle",
            size: "110px",
            color: palette.secondary,
            x: "top-right",
            y: "0"
          }
        ]
      }
    });
    n++;
  }
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(templates, null, 2), "utf-8");

console.log(`✅ ${templates.length} templates générés dans: ${outputPath}`);
