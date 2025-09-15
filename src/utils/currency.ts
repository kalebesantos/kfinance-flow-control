export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  let clean = value.toString().trim();

  // Remove símbolo e espaços
  clean = clean.replace(/[R$\s]/g, '');

  if (clean.includes(',')) {
    // Padrão PT-BR: vírgula é decimal, pontos são milhar
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else {
    // Padrão EN: ponto é decimal (manter apenas o último ponto como decimal)
    const parts = clean.split('.');
    if (parts.length > 2) {
      const decimal = parts.pop();
      clean = parts.join('') + '.' + decimal;
    }
  }

  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

export const formatInputCurrency = (value: string): string => {
  // Remove tudo exceto números e vírgula
  let cleanValue = value.replace(/[^\d,]/g, '');
  
  // Se houver mais de uma vírgula, mantém apenas a última
  const parts = cleanValue.split(',');
  if (parts.length > 2) {
    cleanValue = parts.slice(0, -1).join('') + ',' + parts[parts.length - 1];
  }
  
  // Separa parte inteira e decimal
  const [integerPart, decimalPart] = cleanValue.split(',');
  
  // Formata parte inteira com pontos a cada 3 dígitos
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Limita decimal a 2 dígitos
  const formattedDecimal = decimalPart ? ',' + decimalPart.slice(0, 2) : '';
  
  return formattedInteger + formattedDecimal;
};