export interface EvidenceBlock {
  id: string;
  label: string;
  text: string;
  line?: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  source: string;
  target: string;
  label: string;
}

export interface DiagramPage {
  label: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface ParsedSource {
  kind: 'text' | 'word' | 'slides' | 'diagram' | 'image';
  title: string;
  blocks: EvidenceBlock[];
  diagrams?: DiagramPage[];
  imageMime?: string;
  encoding?: string;
  notice?: string;
}

export interface SourceRecord {
  relativePath: string;
  size: number;
  mtime: number;
  status: 'ready' | 'pending' | 'unsupported' | 'failed';
  parsed?: ParsedSource;
  error?: string;
}

export interface SearchHit {
  relativePath: string;
  title: string;
  block: EvidenceBlock;
}
