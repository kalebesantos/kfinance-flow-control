export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove R$, espaços e substitui vírgula por ponto
  const cleanValue = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(cleanValue) || 0;
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