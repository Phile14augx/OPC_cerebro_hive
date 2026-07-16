import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function getLineNumber(node: any): number {
  return node.getSourceFile().getLineAndColumnAtPos(node.getStart()).line;
}

function getJsxAttributeString(node: any, attrName: string): string | null {
  const attr = node.getAttribute(attrName);
  if (!attr) return null;
  const initializer = attr.getInitializer();
  if (!initializer) return null;

  if (initializer.isKind(SyntaxKind.StringLiteral)) {
    return initializer.getLiteralValue();
  }
  
  if (initializer.isKind(SyntaxKind.JsxExpression)) {
    const expr = initializer.getExpression();
    if (expr) {
      if (expr.isKind(SyntaxKind.StringLiteral) || expr.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return expr.getLiteralText().replace(/['"`]/g, '');
      }
      return `[Dynamic: ${expr.getText()}]`;
    }
  }
  return '[Dynamic]';
}

function getInnerText(node: JsxElement): string {
  let text = '';
  node.getChildrenOfKind(SyntaxKind.JsxText).forEach(n => {
    text += n.getText().trim() + ' ';
  });
  node.getChildrenOfKind(SyntaxKind.JsxExpression).forEach(n => {
    text += '{dynamic} ';
  });
  if (text.trim() === '') {
    // If no text, check if there's an Icon or img inside
    const hasIcon = node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
    if (hasIcon) return '[Icon/Image]';
  }
  return text.trim() || '[Empty]';
}

async function run() {
  const project = new Project();
  project.addSourceFilesAtPaths([
    'components/**/*.tsx',
    'app/**/*.tsx'
  ]);

  const files = project.getSourceFiles();
  console.log(`Starting interaction audit across ${files.length} files...`);

  const results: any[] = [];

  files.forEach(file => {
    const filePath = file.getFilePath().replace(process.cwd(), '').replace(/\\/g, '/');

    // Find all JSX Elements
    const elements = file.getDescendantsOfKind(SyntaxKind.JsxElement);
    const selfClosing = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    
    const processElement = (node: any, isSelfClosing: boolean) => {
      let tagName = '';
      let targetNode = node;
      
      if (isSelfClosing) {
        tagName = node.getTagNameNode().getText();
      } else {
        targetNode = node.getOpeningElement();
        tagName = targetNode.getTagNameNode().getText();
      }

      const isLink = tagName === 'Link' || tagName === 'a';
      const isButton = tagName.toLowerCase().includes('button');
      const isInteractiveComponent = ['Card', 'Accordion', 'Tab', 'Dropdown', 'MenuItem', 'Command', 'Icon'].some(k => tagName.includes(k));
      const hasOnClick = !!targetNode.getAttribute('onClick');
      const hasHref = !!targetNode.getAttribute('href');
      
      // Also check framer-motion handlers like onDrag, onPan, onTap
      const hasGesture = !!targetNode.getAttribute('onTap') || !!targetNode.getAttribute('onDrag');

      if (isLink || isButton || hasOnClick || isInteractiveComponent || hasGesture || hasHref) {
        const line = getLineNumber(node);
        const href = getJsxAttributeString(targetNode, 'href') || '';
        const label = isSelfClosing ? `[${tagName}]` : getInnerText(node);
        
        let destination = href;
        if ((hasOnClick || hasGesture) && !href) {
          const handlerAttr = targetNode.getAttribute('onClick') || targetNode.getAttribute('onTap');
          destination = `Handler: ${handlerAttr?.getInitializer()?.getText() || 'unknown'}`;
        }

        let routeStatus = 'Valid';
        if (href === '#' || href.includes('javascript:void(0)')) routeStatus = 'Placeholder';
        if (href === '') routeStatus = hasOnClick ? 'Action' : 'Missing';
        
        // Determine Priority/Risk (Phase 9 requirement hook)
        let priority = 'Medium';
        if (routeStatus === 'Placeholder' || routeStatus === 'Missing') priority = 'High';
        if (isLink && routeStatus === 'Valid') priority = 'Low';

        results.push({
          Component: path.basename(filePath, '.tsx'),
          File: filePath,
          Line: line,
          Element: tagName,
          Label: label.replace(/[\n\r,]/g, ' '), // remove commas and newlines for CSV
          Destination: destination.replace(/[\n\r,]/g, ' '),
          RouteStatus: routeStatus,
          Priority: priority
        });
      }
    };

    elements.forEach(node => processElement(node, false));
    selfClosing.forEach(node => processElement(node, true));
  });

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'interaction-inventory.csv');
  
  // Build CSV
  const header = ['Component', 'File', 'Line', 'Element', 'Label', 'Destination', 'RouteStatus', 'Priority'].join(',');
  const rows = results.map(r => `${r.Component},${r.File},${r.Line},${r.Element},${r.Label},${r.Destination},${r.RouteStatus},${r.Priority}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  console.log(`Interaction audit complete. Found ${results.length} interactions. Saved to audit/interaction-inventory.csv`);
}

run();
