export default function ScoreBadge({ score, grade }) {
  const cls = score >= 8 ? 'score-high' : score >= 5 ? 'score-mid' : 'score-low';
  return (
    <span className={`score-badge ${cls}`} title={`Quality score: ${score}/10`}>
      {score}/10{grade ? ` · ${grade}` : ''}
    </span>
  );
}
