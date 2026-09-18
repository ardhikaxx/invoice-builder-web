const ones = [
  '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
  'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
];

const tens = [
  '', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh',
  'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'
];

const scales = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

function convertGroup(n: number): string {
  if (n === 0) return '';

  let result = '';
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const tensDigit = Math.floor(remainder / 10);
  const onesDigit = remainder % 10;

  if (hundreds === 1) {
    result = 'Seratus';
  } else if (hundreds > 1) {
    result = ones[hundreds] + ' Ratus';
  }

  if (remainder > 0) {
    if (result) result += ' ';
    if (remainder < 12) {
      result += ones[remainder];
    } else if (remainder < 20) {
      result += ones[remainder - 10] + ' Belas';
    } else {
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += ' ' + ones[onesDigit];
      }
    }
  }

  return result;
}

export function terbilang(amount: number): string {
  if (amount === 0) return 'Nol Rupiah';

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const groups: number[] = [];

  let remaining = absAmount;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;

    let groupStr = convertGroup(groups[i]);
    if (i === 1 && groups[i] === 1) {
      groupStr = 'Seribu';
    } else {
      groupStr += ' ' + scales[i];
    }
    parts.push(groupStr);
  }

  const result = parts.join(' ') + ' Rupiah';
  return isNegative ? `Minus ${result}` : result;
}
