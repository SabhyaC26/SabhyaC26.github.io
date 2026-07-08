import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

interface PromptProps {
  value: string;
  placeholder: string;
  focused: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function Prompt({
  value,
  placeholder,
  focused,
  inputRef,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
}: PromptProps) {
  const cursorClass = `cursor ${focused ? "blink" : "idle"}`;
  return (
    <div className="promptline">
      <span className="sym">❯</span>
      <div className="input-wrap">
        <div className="mirror" aria-hidden="true">
          {value.length === 0 ? (
            <>
              <span className={cursorClass} />
              <span className="placeholder">{placeholder}</span>
            </>
          ) : (
            <>
              {value}
              <span className={cursorClass} />
            </>
          )}
        </div>
        <input
          ref={inputRef}
          className="real-input"
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}
