export interface Suggestion {
  name: string;
  summary: string;
}

interface AutocompleteProps {
  items: Suggestion[];
  activeIndex: number;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
}

export function Autocomplete({ items, activeIndex, onSelect, onHover }: AutocompleteProps) {
  return (
    <div className="autocomplete">
      {items.map((item, i) => (
        <div
          key={item.name}
          className={`ac-item${i === activeIndex ? " active" : ""}`}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item.name);
          }}
        >
          <span className="name">/{item.name}</span>
          <span className="desc">{item.summary}</span>
        </div>
      ))}
    </div>
  );
}
