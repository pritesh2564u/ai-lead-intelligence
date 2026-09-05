import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export const Button = ({
    children,
    variant = "primary",
    active = false,
    className = "",
    ...props
}: {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition ${variant === "primary" ? "bg-ink text-white hover:bg-moss" : variant === "secondary" ? active ? "border border-moss bg-mint text-ink" : "border border-moss/30 bg-white text-ink hover:bg-mint/40" : "text-moss hover:bg-white"} ${className}`}
    >
        {children}
    </button>
);

export const Card = ({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) => (
    <section
        className={`rounded-lg border border-black/10 bg-white p-4 shadow-sm ${className}`}
    >
        {children}
    </section>
);

export const Badge = ({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: "high" | "medium" | "low" | "neutral";
}) => (
    <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "high" ? "bg-mint text-ink" : tone === "medium" ? "bg-amber-100 text-amber-900" : tone === "low" ? "bg-red-100 text-red-900" : "bg-stone-100 text-stone-700"}`}
    >
        {children}
    </span>
);

export const Input = ({
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`h-10 min-w-0 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-moss ${className}`}
    />
);

export const Dropdown = ({
    className = "",
    value,
    onChange,
    placeholder,
    options = [],
}: {
    className?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options?: { value: string; label: string }[];
}) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: Event) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const selected = options.find((option) => option.value === value);

    return (
        <div ref={rootRef} className={`relative min-w-0 ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((state) => !state)}
                className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-moss"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={selected ? "text-ink" : "text-stone-500"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div
                    role="listbox"
                    className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-black/10 bg-white py-1 shadow-lg"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-mint/40 ${
                                    isSelected
                                        ? "bg-mint text-ink"
                                        : "text-ink"
                                }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && (
                                    <Check
                                        size={16}
                                        className="shrink-0 text-moss"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const scoreTone = (score?: number | null) =>
    score == null
        ? "neutral"
        : score >= 80
          ? "high"
          : score >= 60
            ? "medium"
            : "low";
