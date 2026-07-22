interface AeoAnswerBlockProps {
  question: string;
  tldr: string;
  definition?: string;
  benefits?: string[];
  steps?: string[];
  className?: string;
}

// Structured AEO answer block matching Google AI Overview extraction patterns.
// TL;DR + Definition + Benefits/Steps mirrors how AI engines surface answer snippets.
export function AeoAnswerBlock({
  question,
  tldr,
  definition,
  benefits,
  steps,
  className,
}: AeoAnswerBlockProps) {
  return (
    <div
      className={className}
      data-aeo-block="true"
      itemScope
      itemType="https://schema.org/Question"
    >
      <meta itemProp="name" content={question} />
      <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
        <div itemProp="text">
          <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
            <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Quick Answer
            </p>
            <p className="text-lg font-medium leading-snug">{tldr}</p>

            {definition && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Definition</p>
                <p className="text-muted-foreground">{definition}</p>
              </div>
            )}

            {benefits && benefits.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Key Benefits</p>
                <ul className="space-y-1">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex gap-2 text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {steps && steps.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">How It Works</p>
                <ol className="space-y-1 list-none">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5 h-fit mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
