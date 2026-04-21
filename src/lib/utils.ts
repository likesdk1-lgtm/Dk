export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfDigits = cpf.split("").map((el) => +el);
  const rest = (count: number): number => {
    return (
      ((cpfDigits
        .slice(0, count - 12)
        .reduce((soma, el, index) => soma + el * (count - index), 0) *
        10) %
        11) %
      10
    );
  };
  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
}

export function formatCPF(cpf: string): string {
  return cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function generateMatricula(id: number): string {
  // Generate matricula starting with 6039, minimum 8 digits
  const prefix = "6039";
  const numStr = id.toString().padStart(4, "0"); // Ensure at least 8 digits total
  return `${prefix}${numStr}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
