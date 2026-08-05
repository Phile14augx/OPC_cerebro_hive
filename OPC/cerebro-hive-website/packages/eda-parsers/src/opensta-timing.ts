/**
 * OpenSTA timing report parser — ADR 0014 (D3), ADR 0011 (D9).
 *
 * Streaming, incremental, and deterministic. It emits `timing.path` facts whose
 * semantic keys feed signature computation — so the canonicalisation choices in
 * this file directly determine whether "is this the same path as last week?" is
 * answerable at all.
 *
 * What is deliberately EXCLUDED from the semantic key (ADR 0011):
 *   slack, arrival, required, transition — these are what we track *over* the
 *   signature. Including any of them makes every run report 100% new findings.
 *
 * What is INCLUDED: startpoint, endpoint, corner, mode, path group, and the
 * launch/capture clocks. If any of those change, an engineer would say "that's
 * a different path", not "that path changed".
 */

import type { Fact, ParseInput, ParserHost, ParserProvider } from '@cerebro/eda-parser';

const HEADER = /^Startpoint:\s*(\S+)/;
const ENDPOINT = /^Endpoint:\s*(\S+)/;
const PATH_GROUP = /^Path Group:\s*(\S+)/;
const PATH_TYPE = /^Path Type:\s*(\S+)/;
const CORNER = /^Corner:\s*(\S+)/;
const MODE = /^Mode:\s*(\S+)/;
const CLOCK_LAUNCH = /clock\s+(\S+)\s+\(rise edge\)/;
const CLOCK_CAPTURE = /clock\s+(\S+)\s+\(fall edge\)|capture\s+clock\s+(\S+)/;
const SLACK = /^\s*(-?[\d.]+)\s+slack\s+\((MET|VIOLATED)\)/;
const DATA_ARRIVAL = /^\s*(-?[\d.]+)\s+data arrival time/;
const DATA_REQUIRED = /^\s*(-?[\d.]+)\s+data required time/;

/**
 * Canonicalise a hierarchical instance/pin path.
 *
 * Vendors differ in separators and array-index formatting for what is the same
 * object. Normalising here — rather than at comparison time — is what keeps the
 * signature stable across a tool upgrade that changes only formatting.
 */
export function canonicalHierName(raw: string): string {
  return raw
    .trim()
    .replaceAll('\\', '')
    .replaceAll('.', '/')
    .replace(/\[(\d+)\]/g, '_$1_')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');
}

/** Picoseconds as an integer, so no float formatting reaches storage. */
function toPs(nsValue: string): number {
  return Math.round(Number(nsValue) * 1000);
}

/**
 * Fields are `?: T | undefined` rather than `?: T` deliberately.
 *
 * Under `exactOptionalPropertyTypes` the two differ: the bare optional form
 * forbids assigning `undefined`, and a regex capture group is always
 * `string | undefined`. Writing it explicitly keeps the accumulator honest
 * about the fact that any field may legitimately be absent — a report section
 * missing "Corner:" is normal, not an error.
 */
interface PathAccumulator {
  startpoint?: string | undefined;
  endpoint?: string | undefined;
  pathGroup?: string | undefined;
  pathType?: string | undefined;
  corner?: string | undefined;
  mode?: string | undefined;
  clockLaunch?: string | undefined;
  clockCapture?: string | undefined;
  slackPs?: number | undefined;
  arrivalPs?: number | undefined;
  requiredPs?: number | undefined;
  startLine: number;
}

export class OpenStaTimingParser implements ParserProvider {
  readonly id = 'opensta-timing';
  readonly supportedToolVersions = '>=2.0.0 <3.0.0';

  async canParse(_input: ParseInput, head: Uint8Array): Promise<number> {
    const text = Buffer.from(head).toString('utf8');
    if (/^Startpoint:/m.test(text) && /data arrival time/.test(text)) return 0.95;
    if (/^Startpoint:/m.test(text)) return 0.6;
    return 0;
  }

  async *parse(_input: ParseInput, host: ParserHost): AsyncIterable<Fact> {
    let buffer = '';
    let lineNo = 0;
    let acc: PathAccumulator | null = null;

    const flush = function* (a: PathAccumulator): Generator<Fact> {
      if (!a.startpoint || !a.endpoint) return;
      const start = canonicalHierName(a.startpoint);
      const end = canonicalHierName(a.endpoint);

      // Semantic key: identity only. Every measured value lives in payload.
      const semanticKey: ReadonlyArray<readonly [string, string]> = [
        ['startpoint', start],
        ['endpoint', end],
        ['path_type', a.pathType ?? 'setup'],
        ['corner', a.corner ?? 'default'],
        ['mode', a.mode ?? 'func'],
        ['path_group', a.pathGroup ?? 'default'],
        ['clock_launch', a.clockLaunch ?? ''],
        ['clock_capture', a.clockCapture ?? ''],
      ];

      yield {
        factType: 'timing.path',
        payload: {
          startpoint: start,
          endpoint: end,
          pathType: a.pathType ?? 'setup',
          corner: a.corner ?? 'default',
          mode: a.mode ?? 'func',
          pathGroup: a.pathGroup ?? 'default',
          slackPs: a.slackPs ?? null,
          arrivalPs: a.arrivalPs ?? null,
          requiredPs: a.requiredPs ?? null,
        },
        semanticKey,
        // Every derived fact points back to the exact report line that produced
        // it. This is what lets an engineer click through from an agent's claim
        // to the literal text, and how parser bugs get found.
        sourceRef: { line: a.startLine },
        confidence: 1,
      };
    };

    for (;;) {
      const chunk = await host.readChunk(64 * 1024);
      const done = chunk === null;
      if (chunk) buffer += Buffer.from(chunk).toString('utf8');

      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0 || (done && buffer.length > 0)) {
        const line = nl >= 0 ? buffer.slice(0, nl) : buffer;
        buffer = nl >= 0 ? buffer.slice(nl + 1) : '';
        lineNo++;

        let m: RegExpExecArray | null;
        if ((m = HEADER.exec(line))) {
          if (acc) yield* flush(acc);
          acc = { startpoint: m[1], startLine: lineNo };
        } else if (acc && (m = ENDPOINT.exec(line))) {
          acc.endpoint = m[1];
        } else if (acc && (m = PATH_GROUP.exec(line))) {
          acc.pathGroup = m[1];
        } else if (acc && (m = PATH_TYPE.exec(line))) {
          acc.pathType = m[1];
        } else if (acc && (m = CORNER.exec(line))) {
          acc.corner = m[1];
        } else if (acc && (m = MODE.exec(line))) {
          acc.mode = m[1];
        } else if (acc && (m = SLACK.exec(line))) {
          acc.slackPs = toPs(m[1] as string);
        } else if (acc && (m = DATA_ARRIVAL.exec(line))) {
          acc.arrivalPs = toPs(m[1] as string);
        } else if (acc && (m = DATA_REQUIRED.exec(line))) {
          acc.requiredPs = toPs(m[1] as string);
        } else if (acc && !acc.clockLaunch && (m = CLOCK_LAUNCH.exec(line))) {
          acc.clockLaunch = m[1];
        } else if (acc && !acc.clockCapture && (m = CLOCK_CAPTURE.exec(line))) {
          acc.clockCapture = m[1] ?? m[2];
        }

        if (nl < 0) break;
      }

      if (done) break;
    }

    if (acc) yield* flush(acc);
  }
}
