export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <dl className="faq">
      {items.map((item) => (
        <div className="faq__row" key={item.q}>
          <dt className="faq__q">{item.q}</dt>
          <dd className="faq__a">{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
