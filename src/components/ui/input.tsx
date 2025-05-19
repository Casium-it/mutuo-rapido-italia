
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { dynamicWidth?: boolean }>(
  ({ className, type, dynamicWidth, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [width, setWidth] = React.useState<number | null>(null);
    const [placeholder, setPlaceholder] = React.useState(props.placeholder || "");
    
    // Funzione per misurare la larghezza del testo
    const measureText = (text: string): number => {
      if (!text) return 0;
      
      // Creazione di un elemento temporaneo per misurare il testo
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (context) {
        // Applica lo stesso stile di font dell'input
        context.font = window.getComputedStyle(inputRef.current || document.body).font;
        const metrics = context.measureText(text);
        return metrics.width;
      }
      
      return 0;
    };
    
    // Effect per misurare il placeholder e impostare la larghezza iniziale
    React.useEffect(() => {
      if (dynamicWidth && props.placeholder) {
        setPlaceholder(props.placeholder as string);
      }
    }, [props.placeholder, dynamicWidth]);
    
    // Effect per aggiornare la larghezza in base al valore inserito
    React.useEffect(() => {
      if (dynamicWidth && inputRef.current) {
        const value = inputRef.current.value;
        const placeholderWidth = measureText(placeholder);
        const valueWidth = measureText(value);
        
        // Usa la maggiore tra la larghezza del valore e quella del placeholder
        // Aggiungi un padding extra di 20px per evitare che il testo appaia troppo stretto
        const extraPadding = 30;
        const calculatedWidth = Math.max(
          placeholderWidth + extraPadding,
          valueWidth + extraPadding,
          60 // Larghezza minima assoluta di 60px
        );
        
        setWidth(calculatedWidth);
      }
    }, [props.value, dynamicWidth, placeholder]);
    
    return (
      <input
        type={type}
        ref={(el) => {
          // Assegna il ref dell'input
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
          inputRef.current = el;
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background", // Reduced from h-10 to h-9
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "appearance-none",
          className
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          ...(dynamicWidth && width ? { width: `${width}px` } : {})
        }}
        {...props}
        onChange={(e) => {
          // Aggiorna la larghezza quando cambia il valore
          if (dynamicWidth) {
            const valueWidth = measureText(e.target.value);
            const placeholderWidth = measureText(placeholder);
            const extraPadding = 30;
            const calculatedWidth = Math.max(
              placeholderWidth + extraPadding,
              valueWidth + extraPadding,
              60 // Larghezza minima assoluta di 60px
            );
            setWidth(calculatedWidth);
          }
          
          // Chiama l'onChange originale se esiste
          if (props.onChange) {
            props.onChange(e);
          }
        }}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
