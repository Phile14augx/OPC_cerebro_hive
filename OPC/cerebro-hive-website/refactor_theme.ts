import { Project, SyntaxKind, StringLiteral, NoSubstitutionTemplateLiteral, TemplateExpression } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("components/**/*.tsx");
project.addSourceFilesAtPaths("app/**/*.tsx");

const classMap: Record<string, string> = {
  "bg-[#0A0D14]": "bg-background",
  "bg-[#05070A]": "bg-background",
  "bg-[#050A0F]": "bg-background",
  "bg-[#090D14]": "bg-surface",
  "bg-black": "bg-surface",
  "bg-black/50": "bg-surface-secondary",
  "bg-black/80": "bg-surface-secondary",
  "text-white": "text-text-primary",
  "text-white/80": "text-text-secondary",
  "text-[#00F57A]": "text-accent-primary",
  "text-[#00E5FF]": "text-accent-secondary",
  "bg-[#00F57A]": "bg-accent-primary",
  "bg-[#00F57A]/10": "bg-accent-primary/10",
  "bg-[#00F57A]/20": "bg-accent-primary/20",
  "border-[#00F57A]/30": "border-accent-primary/30",
  "text-[#FFB300]": "text-warning",
  "border-white/10": "border-border",
  "border-white/5": "border-border",
  "border-white/20": "border-border",
  "border-white/30": "border-border"
};

const mapClasses = (classStr: string) => {
  let modified = classStr;
  for (const [oldClass, newClass] of Object.entries(classMap)) {
    // Replace whole word matches only (using regex boundaries but handling tailwind syntax)
    const regex = new RegExp(`(?<=^|\\s)${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'g');
    modified = modified.replace(regex, newClass);
  }
  return modified;
};

let filesChangedCount = 0;

project.getSourceFiles().forEach((sourceFile) => {
  let fileChanged = false;

  // Process String Literals
  sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach((node) => {
    const originalText = node.getLiteralText();
    const newText = mapClasses(originalText);
    if (originalText !== newText) {
      node.setLiteralValue(newText);
      fileChanged = true;
    }
  });

  // Process NoSubstitutionTemplateLiterals (`string` without ${})
  sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral).forEach((node) => {
    const originalText = node.getLiteralText();
    const newText = mapClasses(originalText);
    if (originalText !== newText) {
      node.setLiteralValue(newText);
      fileChanged = true;
    }
  });

  // Process TemplateExpressions (`string ${var} string`)
  sourceFile.getDescendantsOfKind(SyntaxKind.TemplateHead).forEach((node) => {
    const originalText = node.getLiteralText();
    const newText = mapClasses(originalText);
    if (originalText !== newText) {
      node.replaceWithText(`\`${newText}\${`);
      fileChanged = true;
    }
  });
  
  sourceFile.getDescendantsOfKind(SyntaxKind.TemplateMiddle).forEach((node) => {
    const originalText = node.getLiteralText();
    const newText = mapClasses(originalText);
    if (originalText !== newText) {
      node.replaceWithText(`}${newText}\${`);
      fileChanged = true;
    }
  });

  sourceFile.getDescendantsOfKind(SyntaxKind.TemplateTail).forEach((node) => {
    const originalText = node.getLiteralText();
    const newText = mapClasses(originalText);
    if (originalText !== newText) {
      node.replaceWithText(`}${newText}\``);
      fileChanged = true;
    }
  });

  if (fileChanged) {
    filesChangedCount++;
    sourceFile.saveSync();
    console.log(`Refactored: ${sourceFile.getFilePath()}`);
  }
});

console.log(`Finished refactoring. ${filesChangedCount} files changed.`);
