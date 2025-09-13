import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { formatInputCurrency, parseCurrency } from '@/utils/currency';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value) {
        const numericValue = parseFloat(value.replace(',', '.'));
        if (!isNaN(numericValue) && numericValue > 0) {
          setDisplayValue(formatInputCurrency(value));
        } else {
          setDisplayValue('');
        }
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Se o campo estiver vazio, permite limpar
      if (inputValue === '') {
        setDisplayValue('');
        onChange('');
        return;
      }

      // Remove caracteres não numéricos exceto vírgula
      const cleanValue = inputValue.replace(/[^\d,]/g, '');
      
      // Formata o valor
      const formatted = formatInputCurrency(cleanValue);
      setDisplayValue(formatted);
      
      // Envia o valor sem formatação para o formulário
      const unformattedValue = formatted.replace(/\./g, '').replace(',', '.');
      onChange(unformattedValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          R$
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`pl-10 ${className}`}
          placeholder="0,00"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';